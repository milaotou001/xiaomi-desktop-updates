# 小咪桌宠 · WorkBuddy 在线部署入口

当前 Windows 部署版1.0.3（应用1.0.2），包含日报日内承接、完整呈现及右键“记着”的手动跨天保留。新老用户共用同一完整包，已有用户按下面的升级分流保留个人资料。

你正在帮助老师安装或升级小咪桌宠。先只读检查本机是否已有小咪及教师配置；不要让老师先卸载。

**已有安装，或老师明确要求更新：先读取 [保留配置升级说明](https://milaotou001.github.io/xiaomi-desktop-updates/upgrade.md)，按说明由你下载新版、核对现场环境并升级。保留身份、偏好、关注群、授权、日报时间、个人设置和已处理记录。不要执行下面的首次安装脚本，不重新建立画像或重建任务。**

**确认首次安装：**继续下面流程。老师已在 WorkBuddy 中完成连接器和钉钉授权时沿用现状，不重复授权。请主动完成本机部署、教师画像、四个日报/提醒任务和最终验收；只在确实需要时请老师确认关注群与晚报时间。

## 1. 确认平台

- Windows 10/11 x64 或 AMD64：继续执行下面的一次解压流程。
- 银河麒麟 ARM64：读取 `https://milaotou001.github.io/xiaomi-desktop-updates/install.json` 中 `kylin-arm64` 的状态；目前尚未发布，安全停止。
- 其他平台、版本或架构不确定：停止并向老师说明。不要猜测、不要拿桌宠更新包代替教师部署包。

## 2. 一次下载、一次校验、一次解压

在 WorkBuddy 的 PowerShell 工具中执行以下**一个代码块**。它先校验安装脚本本身，再由脚本读取固定的 `install.json`，核对平台、包大小和整包 SHA256，检查 ZIP 路径，直接解压到 `%LOCALAPPDATA%\Programs` 同盘临时目录，最后通过目录改名放到固定位置。无须先解压到系统临时目录，再复制整个约 360 MB 的文件夹。

```powershell
$ErrorActionPreference = 'Stop'
$installScript = Join-Path ([System.IO.Path]::GetTempPath()) ('xiaomi-install-' + [guid]::NewGuid().ToString('N') + '.ps1')
Invoke-WebRequest -Uri 'https://milaotou001.github.io/xiaomi-desktop-updates/install-windows.ps1' -OutFile $installScript -UseBasicParsing
$stream = [System.IO.File]::OpenRead($installScript)
$sha = [System.Security.Cryptography.SHA256]::Create()
try { $actual = ([System.BitConverter]::ToString($sha.ComputeHash($stream))).Replace('-', '').ToLowerInvariant() }
finally { $stream.Dispose(); $sha.Dispose() }
if ($actual -ne '75edb91099640b9622b0fcb6a1ad8808a6c62b5a7296412ccc4d8d0aa18c74d5') { throw '安装脚本校验失败，停止部署。' }
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
& $installScript
```

脚本返回 `packageRoot`。若工作环境抓不到标准输出，固定目录是 `%LOCALAPPDATA%\Programs\XiaomiDesktopPetTeacher`，用系统 API 取得真实 `LocalApplicationData`，不要写死 C 盘。已有该目录时脚本会停止，保护现有安装和老师数据；改读上述升级说明，不覆盖或删除旧目录。校验或解压失败时不得运行半成品，也不得把临时目录当成安装目录。

## 3. 读取包内说明并完成部署

完整读取固定目录顶层的《请让WorkBuddy读取这个文件夹.txt》，按其“快速部署流程”执行。先运行 `Prepare` 阶段；普通桌面会话若支持后台 PowerShell，则让 `Runtime` 阶段在后台继续，同时完成教师画像、关注群确认与四个日报任务；等待后台结果后运行 `Final` 阶段并验收。后台工具不可用时顺序执行这几个阶段，检查要求相同。

四个任务必须复用已有的稳定任务 ID，不得因为加速而重复创建。老师本人决定晚报时间，关注群只取本人确认且授权后实际可见的群。最终用老师听得懂的话报告结果和剩余步骤。

`update.json` 是已安装桌宠的旧更新清单，不用于首次安装。自动更新暂不在本次部署范围内。
