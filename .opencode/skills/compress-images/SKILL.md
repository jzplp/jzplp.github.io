---
name: compress-images
description: 使用 ImageMagick 压缩 docs\public 目录下超过 200KB 的图片并原地替换（compress images）。当用户要求压缩图片、缩小图片体积、处理博客大图时使用。支持 PNG/JPEG/GIF，仅在压缩后更小时才替换原图。
---

# 压缩 docs/public 下的大图片

压缩 `docs/public` 目录下超过大小阈值（默认 **200KB**）的图片，并原地替换原文件。

## 环境事实（Windows）

- ImageMagick 安装在 `D:\ImageMagick-7.1.2-Q16-HDRI\magick.exe`，**不在 PATH 中**；直接敲 `magick` 或 `convert` 会命中系统自带的无关程序。必须用完整路径调用：`$magick = "D:\ImageMagick-7.1.2-Q16-HDRI\magick.exe"`。
- Shell 是 Windows PowerShell 5.1。候选文件临时目录用 `$env:TEMP\opencode`（已预授权）。

## 查找目标

```powershell
Get-ChildItem "docs\public" -Recurse -File |
  Where-Object { $_.Extension -match '^\.(jpg|jpeg|png|gif|webp|bmp)$' -and $_.Length -gt 200KB }
```

## 各格式压缩配方

只有候选文件严格小于原图时才替换。记录总的前后字节数，逐文件报告结果。

- **JPEG**：`-strip -interlace Plane -sampling-factor 4:2:0 -quality <Q>` —— Q 从高到低尝试（82 → 78 → 72 → 65），直到低于阈值或无收益。
- **PNG**（按顺序）：
  1. 无损重编码：`-strip -define png:compression-level=9 -quality 95`
  2. 色彩量化（截图类图片效果很好）：加 `-colors <N>`，N 依次取 256、128、64
  3. 仍不达标 → 缩放 + 量化组合，例如 `-resize 50% -colors 48`；逐步缩小尺寸直到达标
- **GIF**：`-coalesce -layers Optimize -strip`
- **WebP**：`-strip -quality 80`

在 `$env:TEMP\opencode` 中生成多个候选，按真实字节大小挑选：优先选已 ≤ 阈值的候选；否则选比原图小的里面最小的那个。

## 血泪教训——不要重蹈覆辙

1. **PNG 量化时绝对不要加 `-dither FloydSteinberg`。** 抖动噪声会让 PNG 体积暴涨（实际案例：同一文件 456KB → 1408KB）。不要写任何 dither 参数。
2. **对路径字符串列表用 `Sort-Object Length` 排的是字符串长度**，不是文件大小。要显式写：`Sort-Object { (Get-Item $_).Length }`。
3. **候选文件路径必须是绝对路径**（`Join-Path $env:TEMP\opencode ...`）。以前出过相对路径把临时文件散落在仓库根目录的事故——处理完务必清理临时文件，并用 `git status` 检查有没有未跟踪的残留。
4. **PowerShell 的 `>` 重定向会损坏二进制内容。** 需要从 git 提取原文件（比如基于未降级的原图重新压缩）时，用 `cmd /c "git show HEAD:path > file"`。
5. FileInfo 对象有 `.FullName` 属性，路径字符串没有。循环里别混用。
6. 对已经被抖动污染/有噪点的图再压缩效果很差。如果上一轮已把图压坏，先从 git 恢复原图，再用干净参数重新压缩。

## 处理完的校验

```powershell
# 不再有超过阈值的图片
Get-ChildItem "docs\public" -Recurse -File | Where-Object { $_.Length -gt 200KB }

# 所有被修改的图片完好无损（防止损坏）
git diff --name-only -- docs/public | ForEach-Object {
  & $magick identify ($_ -replace '/','\'); if ($LASTEXITCODE -ne 0) { "CORRUPTED: $_" }
}

# 没有游离的未跟踪文件
git status --short
```

最后汇报总结：改动了多少个文件、总共节省多少 KB，并提示如果不满意画质可用 `git checkout -- docs/public` 一键回滚。
