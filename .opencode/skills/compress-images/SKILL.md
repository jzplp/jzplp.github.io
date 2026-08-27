---
name: compress-images
description: 使用 ImageMagick 压缩用户指定的图片文件并原地替换（compress images）。梯度策略：小图跳过、中图无损、大图积极量化。当用户要求压缩图片、缩小图片体积时使用。支持 PNG/JPEG/GIF/WebP，仅在压缩后更小时才替换原图。
---

# 压缩图片（梯度策略）

对用户指定的一批图片文件执行梯度压缩，原地替换原文件。

## 环境事实（Windows）

- ImageMagick 安装在 `D:\ImageMagick-7.1.2-Q16-HDRI\magick.exe`，**不在 PATH 中**；直接敲 `magick` 或 `convert` 会命中系统自带的无关程序。必须用完整路径调用：`$magick = "D:\ImageMagick-7.1.2-Q16-HDRI\magick.exe"`。
- Shell 是 Windows PowerShell 5.1。候选文件临时目录用 `$env:TEMP\opencode`（已预授权）。

## 输入

用户指定一批图片文件路径（可来自任意目录）。脚本逐文件处理。

## 梯度压缩策略

根据文件大小采用不同强度的压缩。只有候选文件**严格小于原图**时才替换，且体积缩减**不足 10%** 的一律跳过（不值得折腾）。

| 文件大小 | 策略 | 说明 |
|----------|------|------|
| **< 30KB** | **跳过** | 太小，压缩无意义且易损画质 |
| **30–200KB** | **温和压缩** | 仅去元数据 + 无损重编码，不碰色彩/质量 |
| **> 200KB** | **积极压缩** | 量化/降质量，直到低于 200KB 或无更多收益 |

## 各格式压缩配方

在 `$env:TEMP\opencode` 中生成多个候选，按真实字节大小挑选最小且严格小于原图的那个。

### JPEG（30–200KB）

`-strip -interlace Plane -sampling-factor 4:2:0 -quality 85`

### JPEG（> 200KB）

依次尝试 quality 82 → 78 → 72 → 65，选最小的有效候选。

### PNG（30–200KB，温和）

`-strip -define png:compression-level=9`（仅无损重编码，不动色彩）

### PNG（> 200KB，积极）

按顺序生成多个候选，取最小的：
1. `-strip -colors 256 -define png:compression-level=9`
2. `-strip -colors 128 -define png:compression-level=9`
3. `-strip -colors 64 -define png:compression-level=9`
4. 仍不达标 → 加 `-resize` 组合，例如 `-resize 50% -colors 48`

### GIF

`-coalesce -layers Optimize -strip`

### WebP

`-strip -quality 80`

## 替换判定

```
有效候选 = 候选文件存在 且 体积 > 0 且 体积 < 原图体积
替换条件 = 有效候选存在 且 (体积缩减 ≥ 10%  OR  原 > 200KB 且候选 ≤ 200KB)
```

不满足则跳过，报告"跳过（压缩率不足）"。

## 血泪教训——不要重蹈覆辙

1. **PNG 量化时绝对不要加 `-dither FloydSteinberg`。** 抖动噪声会让 PNG 体积暴涨（实际案例：同一文件 456KB → 1408KB）。不要写任何 dither 参数。
2. **对路径字符串列表用 `Sort-Object Length` 排的是字符串长度**，不是文件大小。要显式写：`Sort-Object { (Get-Item $_).Length }`。
3. **候选文件路径必须是绝对路径**（`Join-Path $env:TEMP\opencode ...`）。以前出过相对路径把临时文件散落在仓库根目录的事故——处理完务必清理临时文件，并用 `git status` 检查有没有未跟踪的残留。
4. **PowerShell 的 `>` 重定向会损坏二进制内容。** 需要从 git 提取原文件（比如基于未降级的原图重新压缩）时，用 `cmd /c "git show HEAD:path > file"`。
5. FileInfo 对象有 `.FullName` 属性，路径字符串没有。循环里别混用。
6. 对已经被抖动污染/有噪点的图再压缩效果很差。如果上一轮已把图压坏，先从 git 恢复原图，再用干净参数重新压缩。

## 处理完的校验

```powershell
# 所有被修改的图片完好无损（防止损坏）
# 将 $modified_files 替换为实际修改的文件列表
$modified_files | ForEach-Object {
  & $magick identify $_ 2>&1; if ($LASTEXITCODE -ne 0) { "CORRUPTED: $_" }
}

# 如果在 git 仓库中，检查有没有临时文件散落在外
git status --short 2>$null
```

最后汇报总结：处理了多少个文件、跳过了多少、压缩了多少、总共节省多少 KB，并提示如果不满意可用版本控制工具回滚。
