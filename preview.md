# 小咪桌宠 1.0.8 · 独立测试版入口

维护者已明确批准本版现场试用。桌宠、部署包、小咪联动技能均为1.0.8，不更换WorkBuddy应用。用户将本页交给WorkBuddy，即明确选择测试版；包内local_candidate是正常候选标记，允许按本页安装或保留资料升级。新老用户统一用完整包。

正式install.md/install.json、upgrade.md/upgrade.json、update.json和安装脚本均不变；其他用户仍使用1.0.5。本页不代表学校电脑自然调度及真实群分页已全部验收通过。

## 校验完整测试包

先读同站[preview.json](https://milaotou001.github.io/xiaomi-desktop-updates/preview.json)，确认channel=preview、Windows x64 ready、三项版本均为1.0.8，按清单下载并完整核验大小与SHA256。只支持Windows10/11 x64，麒麟未发布。

- 下载：[1.0.8完整测试包](https://huaxiao-xiaomi-updates-001.oss-cn-hangzhou.aliyuncs.com/deployment/windows-x64/preview/v1.0.8/xiaomi-teacher-deploy-windows-x64-v1.0.8-preview.zip)
- 大小：147521653字节。
- SHA256：`75301088e414ef4c1e776fadd27deec71659f607c72d0e4af7a39bae1e45cbfd`。

检查ZIP安全路径后解压新独立目录，禁止覆盖旧安装、卸载或清业务目录。不使用旧1.0.7包冒充新版，不再走小更新包分支。

## 已安装：保留资料升级

先只读确认当前真实安装路径、WorkBuddy配置及系统ApplicationData下desktop-pet业务目录。保留本机称呼/职责/关注群/偏好、授权、设置、已处理、记着、历史及永久归档、任务ID/时间/时区/启用状态/工作目录。不要复制维护者身份、来源或16:30等个人设置。

完整读包内《给WorkBuddy-升级小咪.txt》和脚本运行适配说明。按Inspect→备份任务及资料/暂停相关任务/退出该安装小咪→Apply→更新原任务内容→Verify→同步来源→启动/恢复原启用状态操作。Verify在实际业务写入及启动之前运行；备份留本机，失败按原备份恢复，不能用旧业务目录覆盖新增资料。未知程序、不同运行时、定制技能或权限问题按工具结果处理，不绕过校验强覆。

核对实际WorkBuddy技能12文件及原四任务，而非只看关于页版本。任务仅列一次，以KEY唯一匹配，原ID原位更新；缺项仅在可靠完整查询确认不存在且原资料齐全后补建，不新增第二套。原时间未知只询问缺项，不能用新装默认值覆盖。

三日报prompt用新版SKILL共同职责规则与contracts/history-v1.md当前group-resume-v1流程，标记[XIAOMI_INTEGRATION_VERSION=1.0.8][XIAOMI_GROUP_HISTORY=group-resume-v1]，个人要求保留；去掉全部私聊执行块、unified-v5/collector旧块及history-requests旧批次，不追加互相冲突的规则。轮询继续原群提醒及时间守卫、daily_item_id完成过滤，不读单聊、不补历史。原任务完成后批量回读核对ID、日程、启用状态、版本、真实路径及个人要求。

## 确认全新安装

只有确认无旧安装及画像时才运行下面代码，明确传preview.json，不能省略落回正式版。安装脚本SHA256仍须匹配本页固定值。

```powershell
$ErrorActionPreference = 'Stop'
$installScript = Join-Path ([System.IO.Path]::GetTempPath()) ('xiaomi-preview-install-' + [guid]::NewGuid().ToString('N') + '.ps1')
Invoke-WebRequest -Uri 'https://milaotou001.github.io/xiaomi-desktop-updates/install-windows.ps1' -OutFile $installScript -UseBasicParsing
$actual = (Get-FileHash -LiteralPath $installScript -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actual -ne '75edb91099640b9622b0fcb6a1ad8808a6c62b5a7296412ccc4d8d0aa18c74d5') { throw '安装脚本校验失败，停止部署。' }
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
& $installScript -ManifestUri 'https://milaotou001.github.io/xiaomi-desktop-updates/preview.json'
```

按返回packageRoot读取《请让WorkBuddy读取这个文件夹.txt》与《给WorkBuddy-日报自动接线.txt》，完成Prepare/后台Runtime/Final、真实教师画像及本人确认的关注群、四任务接线。只在必要时询问称呼/职责/关注群/晚报时间，沿用已有正常授权。不让老师自己写JSON、找目录或编辑任务。

## 本版行为与现场验收

1. 私聊检查已移除：不扫单聊、不解析联系人、不生成漏回提醒或私聊失败提示。旧私聊侧文件不读取、不批量删除，已有记着快照继续可用。
2. 保留三类事项、日内承接、稳定事项ID、已处理/撤销、长期记着和群提醒。今天漏报先补进今天；昨天及更早只进入原日期历史，不进今天、不补弹历史提醒，保留当时相关的已过期事项。
3. 首次从接通时、新群从确认关注时起记录，重新关注不补取消期间。已有可信起点及覆盖保留，不能从日报存在推断全天全群读完。
4. 三日报先发布今天，再连续分批补最近30自然日内真实缺口，最近一周优先；成功页保存断点不重读，失败继续其他范围，程序至少30秒后最多重试一次，仍失败下报次续，不无限改run_id重试。网络权限正常时以回来当天补齐最近一周为目标，不保证任意消息量限时完成。
5. 面板只看今天及前29天，每次最多连续7日；更早已存记录留本机但无面板入口，不提示更早未补天数；记着不受30日限制。

工具路径指向真实技能目录；账号/群CID及关注范围来自真实授权，不能猜身份、扩群或伪造起点。按现场DWS窄schema/官方返回核实分页与完整性；原始消息只在本轮上下文，不重定向原文文件或日志，模型只提交摘要。来源不明、权限失败或分页不完整不能宣称“无事项”或完整覆盖。

使用真实内容验收，不写假事项、不改真实时钟或任务时间凑触发、不自动替老师点已处理。文件/任务升级和手动读取通过不等于自然调度通过；没观察到的场景如实待验。失败保留原资料与备份。个人资料、完整prompt、群消息、凭据和本机日志不回传本站。
