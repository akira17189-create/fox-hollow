#!/usr/bin/env python3
"""multi-model-query.py — 并发调 3 个金山云模型，每个模型输出独立 .md 文件。

用法:
    python multi-model-query.py <prompt_file> [--novel <path>] [--output-dir <dir>]

环境变量:
    KSYUN_API_KEY  必须设置（金山云 API key）
"""
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

API_BASE = "https://kspmas.ksyun.com/v1"

# 模型清单；max_tokens 是输出上限，可被 --max-tokens 覆盖
MODELS = [
    {"id": "deepseek-v4-flash", "max_tokens": 16000},
    {"id": "kimi-k2.5", "max_tokens": 16000},
    {"id": "mimo-v2.5-pro", "max_tokens": 16000},
    {"id": "glm-5.1", "max_tokens": 16000},
    # 重推理模型（reasoning_content 主导，30 分钟可能超时）：默认不并发，--only 启用
    {"id": "deepseek-v4-pro", "max_tokens": 32000},
    {"id": "kimi-k2.6", "max_tokens": 32000},
    {"id": "qwen3-235b-a22b-thinking-2507", "max_tokens": 32000},
]


def call_model(model_id: str, max_tokens: int, prompt: str, api_key: str) -> dict:
    """调用单个模型；返回 {model, content, usage, elapsed_s, error}。"""
    url = f"{API_BASE}/chat/completions"
    body = json.dumps(
        {
            "model": model_id,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens,
        },
        ensure_ascii=False,
    ).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    start = time.time()
    try:
        with urllib.request.urlopen(req, timeout=1800) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        elapsed = round(time.time() - start, 1)
        msg = data["choices"][0]["message"]
        # 推理模型（kimi/qwen3-thinking/deepseek-r 系列）会把内容放 reasoning_content，content 可能为空
        content = msg.get("content") or ""
        reasoning = msg.get("reasoning_content") or ""
        if not content.strip() and reasoning.strip():
            content = "[警告: content 为空, 以下来自 reasoning_content]\n\n" + reasoning
        return {
            "model": model_id,
            "content": content,
            "usage": data.get("usage", {}),
            "elapsed_s": elapsed,
            "error": None,
        }
    except urllib.error.HTTPError as e:
        body_text = e.read().decode("utf-8", errors="replace")
        return {
            "model": model_id,
            "content": None,
            "usage": {},
            "elapsed_s": round(time.time() - start, 1),
            "error": f"HTTP {e.code}: {body_text[:500]}",
        }
    except Exception as e:
        return {
            "model": model_id,
            "content": None,
            "usage": {},
            "elapsed_s": round(time.time() - start, 1),
            "error": f"{type(e).__name__}: {e}",
        }


def main():
    parser = argparse.ArgumentParser(description="并发调金山云模型")
    parser.add_argument("prompt_file", help="prompt markdown 文件")
    parser.add_argument("--novel", help="原作小说文本路径（可选，附加到 prompt 末尾）")
    parser.add_argument("--output-dir", default="tools/output", help="输出目录")
    parser.add_argument("--only", help="只跑这些模型（逗号分隔 model id）")
    parser.add_argument("--max-tokens", type=int, default=32000, help="每个模型的输出上限")
    parser.add_argument("--serial", action="store_true", help="串行跑（避免并发争抢，单账号建议开）")
    args = parser.parse_args()

    api_key = os.environ.get("KSYUN_API_KEY")
    if not api_key:
        sys.exit("ERROR: 环境变量 KSYUN_API_KEY 未设置")

    prompt_path = Path(args.prompt_file)
    if not prompt_path.exists():
        sys.exit(f"ERROR: prompt 文件不存在: {prompt_path}")

    prompt = prompt_path.read_text(encoding="utf-8")

    if args.novel:
        novel_path = Path(args.novel)
        if not novel_path.exists():
            sys.exit(f"ERROR: 原作文件不存在: {novel_path}")
        novel_text = novel_path.read_text(encoding="utf-8")
        prompt = (
            prompt + "\n\n---\n\n# 原作小说全文（参考素材）\n\n" + novel_text
        )

    selected = MODELS
    if args.only:
        only_set = {s.strip() for s in args.only.split(",")}
        selected = [m for m in MODELS if m["id"] in only_set]
        if not selected:
            sys.exit(f"ERROR: 没有匹配 --only={args.only} 的模型")

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    timestamp = time.strftime("%Y%m%d-%H%M%S")
    char_count = len(prompt)
    print(f"[input] {char_count} 字符 (~{char_count // 3} tokens 估算)")
    workers = 1 if args.serial else max(1, len(selected))
    mode = "串行" if args.serial else "并发"
    print(f"[start] {mode}调用 {len(selected)} 个模型 (max_tokens={args.max_tokens}, read timeout=30min)...")
    print()

    def write_one(res):
        """每完成一个模型立即落盘，方便外部 Claude 实时回收。"""
        safe_name = res["model"].replace("/", "_").replace(".", "-")
        out_path = output_dir / f"{timestamp}_{safe_name}.md"
        if res["error"]:
            content = f"# {res['model']} — ERROR\n\n```\n{res['error']}\n```\n"
        else:
            u = res["usage"]
            header = (
                f"# {res['model']} — Output\n\n"
                f"- Generated: {timestamp}\n"
                f"- Elapsed: {res['elapsed_s']}s\n"
                f"- Tokens in/out: {u.get('prompt_tokens', '?')}/{u.get('completion_tokens', '?')}\n\n"
                f"---\n\n"
            )
            content = header + res["content"] + "\n"
        out_path.write_text(content, encoding="utf-8")
        return out_path

    results = []
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futures = {
            ex.submit(call_model, m["id"], args.max_tokens, prompt, api_key): m["id"]
            for m in selected
        }
        for fut in as_completed(futures):
            res = fut.result()
            results.append(res)
            out_path = write_one(res)  # 立即落盘 (vs 之前等全部完成)
            if res["error"]:
                print(f"  [FAIL] {res['model']} ({res['elapsed_s']}s) -> {out_path}", flush=True)
                print(f"         {res['error'][:300]}", flush=True)
            else:
                u = res["usage"]
                print(
                    f"  [ OK ] {res['model']} ({res['elapsed_s']}s) "
                    f"in/out={u.get('prompt_tokens', '?')}/{u.get('completion_tokens', '?')} "
                    f"-> {out_path}",
                    flush=True,
                )

    print(f"\n[done] {len(results)} 文件全部写入 {output_dir}/", flush=True)


if __name__ == "__main__":
    main()
