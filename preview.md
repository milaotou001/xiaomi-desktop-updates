# 小咪桌宠1.0.7 · 独立测试版入口

这是维护者明确批准的 Windows 1.0.7 现场试用包，新用户用完整包，已有安装优先小更新包；桌宠、部署包及小咪联动技能均为1.0.7，不更换WorkBuddy应用。当前仍在验证定时任务自然触发，不把测试版称为全部实机验收完成的正式版。

用户将本页交给WorkBuddy，即表示明确选择测试版。包内preview标记是正常的试用标记，允许按本页部署。正式版install.md/install.json、upgrade.md/upgrade.json及update.json均保持原样；不要修改它们，不从它们下载1.0.5冒充此测试版，也不要将测试包推给其他用户。

## 测试版清单

先读取同站 [preview.json](https://milaotou001.github.io/xiaomi-desktop-updates/preview.json)。必须确认channel=preview、Windows x64条目ready及版本1.0.7，下载地址/大小/SHA256完整。下载后完整核验大小与SHA256，再检查ZIP安全路径、解压到独立目录，不覆盖已有安装、不卸载。

- 下载：[1.0.7完整测试包](https://huaxiao-xiaomi-updates-001.oss-cn-hangzhou.aliyuncs.com/deployment/windows-x64/preview/v1.0.7/xiaomi-teacher-deploy-windows-x64-v1.0.7-preview.zip)
- 大小：147534848字节。
- SHA256：`c18a334d4d4d8421766a4b07c91bb300480e4ca90578ac6a2a8a2ad4d99a85ad`。
- 支持Windows 10/11 x64，麒麟及其他平台此次不发布。

## 先判断已有安装，再执行对应分支

先只读检查真实运行路径、现有快捷方式、小咪设置和教师配置。已有安装或已有画像按升级分支，不能先卸载、清业务目录、重建身份或把测试当首次安装。保留当前电脑自己的称呼、职责、关注群、偏好、授权、设置、已处理、记着、台账、永久归档、首次scope、任务ID与日报时间，不复制维护者电脑的身份、来源或时间。

### 已安装用户：保留资料升级

优先从preview.json的upgrade_packages.windows-x64下载小更新包（3158303字节，SHA256 `a777e9bbe7c4d971352a844de9a6ddc44d92e62e65a775dee10b714f048b7f0c`），核验后安全解压到与旧安装、WorkBuddy配置、业务目录互不包含的新暂存目录。完整读取包内《给WorkBuddy-升级小咪.txt》（有脚本适配说明时一并读取），按Inspect→备份/暂停写入→Apply→原任务内容更新/回读→Verify→历史initialize→启动/恢复启用的流程操作，不运行首次引导，不重建画像。

小更新包不含整套Electron，不能用于新装。Inspect要求已安装的74项不可变运行时逐一匹配；缺失、损坏或不同基线时改下完整包，仍遵守完整包的检查与备份，不绕过拒绝、不卸载。

不能仅替换桌宠：WorkBuddy小咪技能及四任务完整prompt也要更新到同版规则，工具路径指向实际技能目录。已有任务保留原ID及老师已确认的时间；可靠完整查询确认KEY与标准名称均不存在，且原画像、来源、工作目录与运行时间明确时，仅补建缺失项，不创建第二套。时间未知只问缺失的时间，不能用默认值覆盖已知旧时间。不可靠/重复匹配/未知文件哈希按升级说明停止并说明，不强行覆盖。

版本号相同也要按实际文件/规则判断，不能看到“1.0.7”就跳过技能与任务回读。文件Verify只验文件，不代表任务通过；两个部分都核对后再报告配置状态。失败用本机程序/任务备份恢复，不拿旧业务目录覆盖老师新数据。

### 确认全新安装：明确使用测试清单

只在确认无现有安装/画像时使用下面代码块。沿用既有公开安装脚本，但必须显式传入preview.json，不能省略参数落回正式版install.json。老师已有钉钉连接器授权时沿用，无需重做。

```powershell
$ErrorActionPreference = 'Stop'
$installScript = Join-Path ([System.IO.Path]::GetTempPath()) ('xiaomi-preview-install-' + [guid]::NewGuid().ToString('N') + '.ps1')
Invoke-WebRequest -Uri 'https://milaotou001.github.io/xiaomi-desktop-updates/install-windows.ps1' -OutFile $installScript -UseBasicParsing
$actual = (Get-FileHash -LiteralPath $installScript -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actual -ne '75edb91099640b9622b0fcb6a1ad8808a6c62b5a7296412ccc4d8d0aa18c74d5') { throw '安装脚本校验失败，停止部署。' }
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
& $installScript -ManifestUri 'https://milaotou001.github.io/xiaomi-desktop-updates/preview.json'
```

按返回的packageRoot完整读取《请让WorkBuddy读取这个文件夹.txt》，完成Prepare/Runtime/Final及教师画像、关注群、四任务和验收。原生任务不存在才创建，存在则原ID更新；仅在必要时请老师选择关注来源、晚报时间并亲自完成正常授权。不要让老师找目录、写JSON或管理补查。

## 本版新增：私聊与群合成一份日报

私聊是默认基础功能，沿用既有WorkBuddy/钉钉授权。早、午、晚报先收群与私聊消息，WorkBuddy一次统一整理，再一次发布到原“非常紧急/需要处理/看一下即可”三档；不另开私聊区域、不设五人限制。只读，不代回复、不标已读；轮询和群历史不扫私聊，私聊摘要不进群history。记着/已处理照常使用。

原三日报使用[XIAOMI_PRIVATE_CHAT=unified-v5]，轮询excluded-poll；集成版本标记改为1.0.7，原ID/日程/时区/个人要求保留。只用包内当前contracts/private-chat-v1.md，不追加旧v2/v3/v4。prepare --joint →一次collect→一次统一筛选→一次publish；读取最多60秒，seal后180秒整理且不再读取。私聊失败才群日报兜底，如实提示失败。

本机小包升级、资料保留和真实无新消息时的采集/发布已通过；有新私聊的筛选效果、学校新电脑和自然调度仍待现场观察。发布过程中保留上一组日报/私聊配对，避免旧私聊暂时消失。内容由WorkBuddy及其配置的模型处理，不宣称全程仅本机。

## 本版行为与试用验收

今天日报持续入账，午晚报沿用日内承接；往期日报看近30天、每次合并最多7天，右键记着，已处理只读。首次接通先做好今天日报，再静默补前7天；起点以前空白日显示未纳入记录，不继续追补；以后自动补近30天内漏跑日，不覆盖今天、不补弹历史提醒。完整台账长期保留，移出面板前由工具保存日归档，不手工清理history-archive。

只用真实授权内容验收，不能写假事项、伪造完整coverage、统一标读或更改任务时间凑触发。原生轮询若使用HOURLY+时段守卫实现，应如实说明窗外可能唤醒后退出，不能称调度层已限定时段；窗外不查群、不改日报、不发提醒。下个正常报次未到时报告“安装和配置已完成，定时自然触发待观察”，不因此阻止已批准的现场试用，也不谎称全部验收通过。

所有身份、任务快照、群消息、凭据和本机日志只在用户电脑留存，不回传本网站。安装或试用遇到问题保留原数据和本机备份，交维护者复核；不要卸载清空。只对明确使用本测试入口的用户部署此版本。
