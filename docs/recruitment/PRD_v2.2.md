# Xianova 官网招聘功能 PRD

版本：v2.2  
更新日期：2026-10-29  
状态：后端和管理后台已部署开发服务器；官网前端保持本地验收版本，生产未发布  
开发计划：[DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)  
本地验收：[LOCAL_ACCEPTANCE.md](./LOCAL_ACCEPTANCE.md)

本文是后续已确认需求的最新基线。原 [PRD.md](./PRD.md) 按用户要求保留为历史版本，其中与本文冲突的旧待确认项不再适用。数据库字段详见本文附录及 [schema_draft.sql](./schema_draft.sql)。

## 1. 目标和范围

官网增加“加入我们”，候选人浏览岗位和 JD、填写联系方式并上传简历。Sparkling 后端登记申请并通过独立邮箱发送附件；Sparkling 管理后台负责岗位发布和申请跟进。

已确定：

- 三仓均使用新分支 `codex/xianova-recruitment`。后端基于 `feature/desk-module`；官网和后台基于各自原工作分支。
- 手机号、姓名、邮箱、简历、招聘隐私告知确认必填。
- 单份 PDF / DOCX，最大 **10 MiB = 10,485,760 字节**；整个 HTTP 请求最大 **11 MiB = 11,534,336 字节**。前端选择时和提交前均检查，后端独立限制读取。
- 简历只在受限内存中临时处理，作为邮件附件发送。不上传对象存储、不写数据库二进制、不生成永久下载链接，不保留服务器简历副本。
- 持久化岗位、表单、附件元信息、发送尝试、状态和管理操作。候选人无需注册。
- 本地程序使用用户指定的阿里云开发库 `xuanya_admin_dev`；仅新增招聘专用表，不修改原业务表。
- 本地和开发阶段发件人、SMTP 登录账号、收件人均为 `fuyong@xianova.ai`。正式上线再提供和切换 HR 凭据。
- 招聘的 SMTP 配置、客户端和接口与现有 CONTACT 邮件完全隔离；原 Sparkling 邮件继续使用。
- 官网“联系我们”保持原行为，本期不接后端、不新增联系记录。
- 三仓招聘实现与文档已推送开发分支。2026-10-29用户随后授权部署开发环境，仅更新Sparkling后端和管理后台；官网前端不部署，生产不发布，未合并正式分支。

本期不包含简历自动解析、人才库、候选人账号、自动筛选、面试录用、批量导出、简历下载和附件长期存储。参考截图中的学历、工作年月和渠道等扩展字段未纳入本期。

## 2. 用户与流程

| 用户 | 能力 |
| --- | --- |
| 访客 | 浏览已发布岗位和 JD，提交申请，持短期凭据查询自己的最小投递状态和受控补传。 |
| ADMIN / SUPER_ADMIN | 创建、编辑、预览、发布、下线岗位；查询申请、查看详情、更新跟进、清理个人资料。 |
| 其他登录角色 / 离线访客 | 无招聘管理权限，禁止读取候选人资料。 |

流程：后台创建草稿 → 明确发布 → 官网列表和详情可见 → 候选人填写并选文件 → 先登记申请并快速返回 → 招聘专用有界队列预留发信尝试 → 事务外 SMTP 投递 → 更新邮件状态 → 后台跟进。

编辑已发布岗位只改草稿，重新发布后才替换公开版本。申请保存提交时的岗位快照，后续岗位修改不影响历史申请。下线检查和申请登记锁定同一岗位行。

## 3. 官网页面

| 页面 | 路由 | 要求 |
| --- | --- | --- |
| 导航 | 桌面及移动菜单 | 增加“加入我们”，沿用现有 Header 和 next-intl。 |
| 岗位列表 | `/[locale]/careers` | 读取公开接口，展示名称、部门、地点、类型和申请入口；搜索、加载、空列表、错误提示。 |
| 岗位详情 | `/[locale]/careers/[jobId]` | 展示发布版本职责与要求；安全文本 / Markdown 子集，不执行原始 HTML。 |
| 申请表 | `/[locale]/careers/[jobId]/apply` | 岗位摘要、必填联系方式、可选说明、文件限制、主动隐私确认、投递结果和备用邮箱。 |

中英文固定界面文案齐全。英文岗位内容均为选填，不影响保存或发布；英文页按字段优先展示英文，未填、空值或仅空白时回退中文原文，包括岗位名称、地点、部门、职责和要求。列表显示简短缺译提示，详情及申请页显示说明。中文页始终展示中文。此次不接第三方翻译接口，也不部署本地翻译模型。关闭、草稿或不存在的岗位不可投递。

| 字段 | 规则 |
| --- | --- |
| 姓名 | 必填，最多100字符，不允许换行和控制字符。 |
| 邮箱 | 必填，最多254字符，服务端验证格式和邮件头注入。 |
| 区号和手机号 | 必填；独立区号支持手动输入和可搜索下拉选择，每项展示国旗、国家或地区名称及区号；名称随中英文界面切换。规范化为 E.164 形式，不限定中国大陆号码。 |
| 补充说明 / 作品链接 | 可选，最多2000字符；不执行 HTML。 |
| 简历 | 必填，一份 PDF / DOCX；非空；10 MiB；检查扩展名、PDF 特征或 DOCX ZIP 结构及解压体积。 |
| 隐私确认 | 无默认勾选，提交当前告知版本 `recruitment-privacy-v1`。 |

超限文件选择后立即清空并提示“尚未上传”；提交前再次检查，不把已知超限文件加入 FormData。配置接口只能收紧前端10 MiB硬上限。

前端直传 Java 接口，浏览器生成 multipart boundary；不走对象存储、Vercel 上传函数或前端 SMTP。SMTP 密码不会进入前端配置、请求或构建产物。

## 4. 管理后台

路由：`/#/admin/xianova-recruitment/jobs` 和 `/#/admin/xianova-recruitment/applications`。

岗位管理：分页筛选、不可变岗位编号、中英文名称 / 地点 / JD、部门（英文选填）、类别、类型、排序、草稿预览和发布版对照、发布确认、下线及重新发布。保存使用 `rowVersion` 防止覆盖其他编辑。

申请管理：默认查询近30天，支持日期、岗位、邮件状态、跟进状态，以及姓名 / 邮箱 / 完整电话 / 申请编号精确查询。详情展示联系方式、补充说明、投递时岗位版本、附件元信息和通知尝试。跟进状态为 NEW / CONTACTED / CLOSED，备注最多2000字符。清理个人资料需二次确认，物理删除申请及关联通知；邮箱原邮件需负责人另行清理。

招聘页面不启用 keep-alive，卸载和退出时清空页面个人信息。离线访客不可使用。现有前端用户信息中的固定角色不作为授权依据，新增 session 接口以服务端角色核验；每个管理接口仍独立校验登录与 ADMIN 权限。

## 5. 后端接口

统一前缀只出现一次 `/api`；响应沿用 `success / data / message`，招聘响应 `Cache-Control: no-store`。错误含稳定 `code`，不向前端返回数据库连接、密码或 SMTP 原始异常。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/xianova/recruitment/jobs` | 已发布岗位分页，最多100条。 |
| GET | `/api/xianova/recruitment/jobs/{jobCode}` | 公开岗位编号查询发布快照。 |
| GET | `/api/xianova/recruitment/form-config` | 字节限制、格式、隐私版本及全文、备用邮箱、开关。 |
| POST | `/api/xianova/recruitment/applications` | multipart，表单及resume；入库并进入后台发送队列后返回201及内部关联申请编号，页面不展示编号。重复请求仍返回原记录，不以HTTP状态判断是否新建。 |
| POST | `/api/xianova/recruitment/applications/status` | JSON幂等键，`X-Application-Token`；仅返回本申请最小状态。 |
| POST | `/api/xianova/recruitment/applications/{applicationNo}/resume` | multipart新附件及token，关联原申请受控补传。 |
| POST | `/api/admin/xianova/recruitment/session` | 登录角色核验，返回uid和role。 |
| POST | `/api/admin/xianova/recruitment/jobs/list` | 管理岗位分页。 |
| POST | `/api/admin/xianova/recruitment/jobs/detail` | id查询草稿及发布快照。 |
| POST | `/api/admin/xianova/recruitment/jobs/create` | jobCode、payload，创建草稿。 |
| POST | `/api/admin/xianova/recruitment/jobs/update` | id、rowVersion、payload。 |
| POST | `/api/admin/xianova/recruitment/jobs/publish` | id、rowVersion，发布当前草稿。 |
| POST | `/api/admin/xianova/recruitment/jobs/offline` | id、rowVersion，下线。 |
| POST | `/api/admin/xianova/recruitment/applications/list` | 管理申请分页，最多100条。 |
| POST | `/api/admin/xianova/recruitment/applications/detail` | id查询详情及通知尝试，不返回token摘要和初次指纹。 |
| POST | `/api/admin/xianova/recruitment/applications/update-follow-up` | id、rowVersion、followUpStatus、note。 |
| POST | `/api/admin/xianova/recruitment/applications/erase-personal-data` | id、confirmed=true；发送中禁止清理。 |

错误使用400字段无效、401未登录、403无权 / 无效凭据、404不存在、409岗位关闭 / 版本冲突 / 幂等内容冲突、413超限、415不支持格式、429频繁或次数限制、503不可用。

## 6. 幂等、邮件状态和恢复

前端为每次新申请生成UUID幂等键和独立256位随机token，仅在提交结果未确认时保留在当前会话，成功登记后清除，同时重置表单和文件。候选人无需登录，可以再次正常填写并提交；每次新申请使用新标识。数据库仅保存token的SHA-256摘要，30分钟过期。token不能出现在URL或日志中。

初次表单与附件摘要形成固定指纹。同幂等键、同token、同内容返回原记录；修改内容返回冲突。补传只更新附件元信息并追加通知尝试，初次指纹、个人表单和岗位快照不变。

| 状态 | 含义及动作 |
| --- | --- |
| PENDING | 已登记，等待发送。 |
| SENDING | 已预留当前尝试；禁止并发重发。 |
| SMTP_ACCEPTED | SMTP服务器已受理；不宣称收件人已读。 |
| FAILED | 可确定本次未受理；有效token下可补传。 |
| UNKNOWN | 网络超时、进程中断或无法确定结果；保留原编号人工核查，不自动重复发送。 |
| REUPLOAD_REQUIRED | 附件不可恢复且明确需要补传的恢复状态。 |

补传最多共3次发送，相邻至少60秒，且仍须在初次提交30分钟有效期内。发送尝试在申请行锁中预留，用当前attempt_id防止旧结果覆盖。SENDING超过5分钟转UNKNOWN。

页面请求超时120秒；接口不等待SMTP完成，成功入库并进入队列后即返回。候选人仅看到友好的“申请已提交”，不显示内部申请编号、SMTP状态或实现说明；提交后不轮询邮件状态。只有请求异常时查询原提交，避免网络重试重复登记。成功后清除本次标识、表单和文件；不设置“再次投递”按钮，用户可直接重新填写提交。

## 7. 邮箱配置和内容

招聘专用命名空间 `XIANOVA_RECRUITMENT_*`。客户端内部持有自己的 `JavaMailSenderImpl`，不注册全局MailSender Bean，不修改 `spring.mail.*`、CONTACT_* 或旧飞书目标。关闭、缺配置只影响招聘，不回退旧账号。

| 项目 | 本地 / 开发 |
| --- | --- |
| SMTP | `smtp.feishu.cn:465`，SSL开启，STARTTLS关闭。 |
| 登录账号、From、To | `fuyong@xianova.ai`，收件人固定在后端。 |
| 密码 | 使用用户提供的专用密码，保存于Git忽略配置；文档和前端不重复明文。 |
| Reply-To | 候选人填写且经校验的邮箱。 |
| 超时 | 连接5秒、读写20秒。 |
| 生产 | 替换HR参数，显式prod环境；测试账号不得作为生产兜底。 |

邮件主题包含环境、岗位编号、候选人姓名和申请编号。正文同时提供HTML排版和纯文本版本，按“申请编号及时间 / 应聘人信息 / 应聘岗位 / 岗位职责 / 任职要求”分区。岗位名称、部门、地点、类型、发布版本使用中文标签，JD保留换行；**不直接输出JSON**。所有候选人和岗位文本转义，附件使用安全名resume.pdf或resume.docx，保留可取得的Message-ID。

本地 `recruitment-local.env` 为Git忽略文件；无密钥示例位于后端 `docs/recruitment-mail.env.example`。正式HR配置、公开告知主体和邮箱清理责任在上线前确认。

## 8. 上传、跨域和限流

上传在读取前检查Content-Length，并对无Content-Length的输入流实施11 MiB边界。招聘路径跳过原全局multipart预解析，其他上传继续使用原标准解析器及500MB配置。最多20个part，文本part最多8192字节，同时最多4个招聘上传。DOCX最多2000条ZIP记录、解压总量50 MiB，不落盘解压，不支持宏文件。

公开CORS精确允许Xianova域名和本地3000来源，GET / POST / OPTIONS、Content-Type和X-Application-Token，不带凭据。管理路径允许Authorization并保留凭据；保留现有管理域名。招聘CORS过滤器先于限流执行，413 / 429 / 503仍能被前端读取。

公开接口只按指定路径免登录，后台保持登录拦截和角色校验。上传每IP每10分钟5次，状态每分钟30次，Redis使用招聘独立key，Redis不可用不无条件放行。当前本地按TCP对端取IP；**部署代理前必须按可信代理拓扑接入真实IP解析和网关路径限制**，不能信任任意X-Forwarded-For。

## 9. 数据库设计与持久化

开发库实测MySQL8.0.36，Asia/Shanghai时间约定。现有表分布：68张utf8mb4_0900_ai_ci、8张utf8mb4_unicode_ci、13张utf8mb3_general_ci。新表显式采用多数业务表的 **InnoDB / utf8mb4 / utf8mb4_0900_ai_ci**，不改原库默认值或已有表。枚举、编号和摘要字段按设计使用ASCII。

| 表 | 职责 | 关系 |
| --- | --- | --- |
| xianova_recruitment_job | 岗位草稿、发布快照、公开查询投影及版本。 | 一岗位对应多申请。 |
| xianova_recruitment_application | 联系信息、岗位和告知快照、附件元信息、幂等凭据摘要、通知及跟进状态。 | job_id逻辑引用岗位。 |
| xianova_recruitment_notification_attempt | 每次SMTP预留、实际收发件人、附件摘要和脱敏结果。 | application_id逻辑引用申请。 |
| xianova_recruitment_audit_log | 管理操作、版本变更和个人资料清理凭据。 | target_type / target_id关联目标；目标删除后短期保留。 |

四表共95字段、18索引，不建物理外键。内部BIGINT主键对外按字符串，操作人逻辑引用现有user.uid，不为候选人创建账号。数据库无简历BLOB、永久文件路径或下载地址。

必要冗余：岗位草稿和发布版服务不同可见性；published_*是发布事务同步的查询投影；申请中的岗位 / 告知快照保留提交时事实；每次尝试保留当次附件摘要便于排查。以上不是重复保存简历。规范化电话用于联系信息精确查询。

服务采用JdbcTemplate参数化SQL、ObjectMapper JSON映射和TransactionTemplate，沿用现有数据库连接及登录上下文，无额外ORM实体生成；所有表名和查询列均为代码常量。

申请登记、岗位状态校验在事务内；SMTP在事务外。预留发送尝试与申请状态同事务；回写检查attempt_id。草稿编辑、发布和跟进使用行版本。幂等键唯一、尝试序号唯一；CHECK覆盖站点、状态、JSON结构、附件大小、必填确认和保留期限。

已新增迁移 `V20261029035648__create_xianova_recruitment.sql`。开发库没有flyway_schema_history；本次在确认四张招聘表均不存在后，只应用该文件的四条建表语句，未baseline或运行整库migrate。**上线前须按项目迁移规程核对基线与历史，不能把本次手动应用当成Flyway validate通过。**

## 10. 数据生命周期

服务器不落盘保存简历，因此没有招聘临时文件遗留扫描任务。内存处理结束后释放引用；不把文件、正文、token和SMTP异常详情写日志。

申请最多保留180天，招聘目的提前结束时由管理员提前清理；通知尝试、token、联系信息和跟进备注随申请物理删除。每分钟检查发送中断、token到期、申请到期和审计到期；活动发送不被清理。管理审计最多180天。SMTP无法删除邮箱原邮件，负责人需按必要期限人工清理邮件及附件。

部署规程：日志最多30天、备份最多30天轮换；删除凭据应在独立于被恢复备份的介质留存，恢复后先重放删除再开放个人信息查询。当前尚未部署，也尚未验证实际备份恢复；该项属于上线前执行清单。删除、撤回等请求核验后7个工作日内处理。

## 11. 本地验收与上线边界

本地地址、启动命令、实际测试结果和样例编号以 [LOCAL_ACCEPTANCE.md](./LOCAL_ACCEPTANCE.md) 为准。前后端已通过构建；已做真实开发库集成测试、浏览器后台发布→官网展示→投递→申请详情与跟进，以及指定邮箱SMTP实测。

上线前仍需：用户本地验收、正式岗位/JD、HR凭据、公司主体及最终隐私告知、开发/生产网关与可信代理、Flyway基线、日志和备份恢复、监控及处理责任人。上述准备不视为已部署完成。

## 附录：数据库字段与索引

以下从本次SQL设计生成，所有业务备注为中文；完整CHECK、默认值、字符集和索引定义以SQL为准。

### xianova_recruitment_job

Xianova招聘岗位草稿与发布快照。

| 字段 | 类型与约束 | 中文备注 |
| --- | --- | --- |
| `id` | `bigint NOT NULL AUTO_INCREMENT` | 内部自增主键 |
| `site_code` | `varchar(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'xianova'` | 站点标识，固定为xianova |
| `job_code` | `varchar(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | 创建后不可变的公开岗位编号 |
| `status` | `varchar(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'DRAFT'` | 业务状态，取值由本表约束限定 |
| `draft_payload` | `json NOT NULL` | 经过结构校验的完整岗位草稿，结构版本为1 |
| `published_payload` | `json DEFAULT NULL` | 仅明确发布时更新的完整公开岗位快照 |
| `draft_revision` | `int NOT NULL DEFAULT 1` | 当前草稿版本，每次保存递增 |
| `published_revision` | `int DEFAULT NULL` | 最近发布时对应的草稿版本 |
| `row_version` | `int NOT NULL DEFAULT 0` | 乐观锁版本，每次业务变更递增 |
| `published_title_zh` | `varchar(200) DEFAULT NULL` | 已发布中文岗位名称 |
| `published_title_en` | `varchar(200) DEFAULT NULL` | 已发布英文岗位名称 |
| `published_department` | `varchar(100) DEFAULT NULL` | 已发布岗位所属部门 |
| `published_category` | `varchar(64) DEFAULT NULL` | 已发布岗位类别 |
| `published_location` | `varchar(200) DEFAULT NULL` | 已发布岗位地点 |
| `published_employment_type` | `varchar(32) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL` | 已发布招聘类型 |
| `published_sort_order` | `int NOT NULL DEFAULT 0` | 已发布排序值，数字较小的优先 |
| `created_by_uid` | `int NOT NULL` | 创建管理员编号，逻辑关联用户表uid |
| `updated_by_uid` | `int NOT NULL` | 最近编辑管理员编号 |
| `published_by_uid` | `int DEFAULT NULL` | 最近发布管理员编号 |
| `published_at` | `datetime(3) DEFAULT NULL` | 最近明确发布的时间 |
| `offline_at` | `datetime(3) DEFAULT NULL` | 最近下线时间，重新发布时清空 |
| `created_at` | `datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | 记录创建时间，统一北京时间 |
| `updated_at` | `datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | 记录更新时间，统一北京时间 |

索引：

- `PRIMARY KEY (`id`)`
- `UNIQUE KEY `uk_xr_job_code` (`site_code`, `job_code`) COMMENT '同站点岗位编号唯一'`
- `KEY `idx_xr_job_public` (`site_code`, `status`, `published_sort_order`, `id`) COMMENT '公开岗位状态及稳定排序查询'`
- `KEY `idx_xr_job_category` (`site_code`, `status`, `published_category`, `published_sort_order`, `id`) COMMENT '公开岗位类别筛选与排序'`

### xianova_recruitment_application

Xianova应聘申请及附件元信息，不保存简历内容。

| 字段 | 类型与约束 | 中文备注 |
| --- | --- | --- |
| `id` | `bigint NOT NULL AUTO_INCREMENT` | 内部自增主键 |
| `application_no` | `char(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | 随机公开申请编号，本身不具备授权能力 |
| `site_code` | `varchar(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'xianova'` | 站点标识，固定为xianova |
| `job_id` | `bigint NOT NULL` | 岗位内部主键，逻辑关联岗位表 |
| `job_code_snapshot` | `varchar(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | 提交时的稳定岗位编号快照 |
| `job_published_revision` | `int NOT NULL` | 提交时的岗位发布版本 |
| `job_snapshot` | `json NOT NULL` | 提交时完整岗位公开内容快照 |
| `candidate_name` | `varchar(100) NOT NULL` | 候选人姓名 |
| `candidate_email` | `varchar(254) NOT NULL` | 候选人邮箱，不作为唯一申请标识 |
| `phone_country_code` | `varchar(4) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | 含加号的手机国家区号 |
| `phone_national_number` | `varchar(15) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | 规范化后的本地手机号码 |
| `phone_e164` | `varchar(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | 含国家码的完整手机号码，供精确查询 |
| `message` | `varchar(2000) DEFAULT NULL` | 候选人补充说明 |
| `resume_original_name` | `varchar(255) NOT NULL` | 最近接收简历的原始文件名 |
| `resume_attachment_name` | `varchar(255) NOT NULL` | 最近接收简历的安全附件名称，不是文件路径 |
| `resume_size_bytes` | `bigint NOT NULL` | 最近接收简历的字节大小，上限为10MiB |
| `resume_mime_type` | `varchar(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | 最近接收简历经验证的文件类型 |
| `resume_sha256` | `char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | 最近接收简历的摘要，不保存文件内容 |
| `privacy_accepted` | `tinyint NOT NULL` | 隐私告知主动确认结果，必须为1 |
| `privacy_version` | `varchar(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | 提交时招聘隐私告知版本 |
| `privacy_snapshot` | `json NOT NULL` | 当时展示的告知正文及联系信息快照 |
| `privacy_accepted_at` | `datetime(3) NOT NULL` | 后端记录的告知确认时间 |
| `idempotency_key` | `char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | 初次提交的标准小写UUID幂等键 |
| `request_fingerprint` | `char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | 初次规范化表单和原始文件的指纹，补传不改写 |
| `submission_token_hash` | `char(64) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL` | 当前会话凭据的安全摘要，不保存明文 |
| `token_expires_at` | `datetime(3) DEFAULT NULL` | 会话凭据到期时间，到期撤销时可清空 |
| `email_status` | `varchar(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'PENDING'` | 申请当前邮件状态，不等于送达或已读 |
| `follow_up_status` | `varchar(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'NEW'` | 管理跟进状态，独立于邮件状态 |
| `follow_up_note` | `varchar(2000) DEFAULT NULL` | 管理员跟进备注，随个人资料一同清理 |
| `follow_up_by_uid` | `int DEFAULT NULL` | 最近跟进管理员编号 |
| `follow_up_at` | `datetime(3) DEFAULT NULL` | 最近跟进时间 |
| `attempt_count` | `smallint unsigned NOT NULL DEFAULT 0` | 已预留发送次数，包含失败和未知，最多3次 |
| `sending_attempt_id` | `bigint DEFAULT NULL` | 当前发送尝试主键，作为条件更新隔离标识 |
| `sending_started_at` | `datetime(3) DEFAULT NULL` | 当前发送开始时间，供异常扫描 |
| `last_attempt_at` | `datetime(3) DEFAULT NULL` | 最近一次预留发送的时间 |
| `retry_after_at` | `datetime(3) DEFAULT NULL` | 允许再次发送的最早时间 |
| `retention_expires_at` | `datetime(3) NOT NULL` | 本记录保留截止时间，由后端可信时钟计算 |
| `row_version` | `int NOT NULL DEFAULT 0` | 乐观锁版本，每次业务变更递增 |
| `request_id` | `char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | 本次请求或操作的追踪编号 |
| `created_at` | `datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | 记录创建时间，统一北京时间 |
| `updated_at` | `datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | 记录更新时间，统一北京时间 |

索引：

- `PRIMARY KEY (`id`)`
- `UNIQUE KEY `uk_xr_application_no` (`application_no`) COMMENT '公开申请编号唯一'`
- `UNIQUE KEY `uk_xr_application_idempotency` (`site_code`, `idempotency_key`) COMMENT '同站点提交幂等键唯一'`
- `KEY `idx_xr_application_created` (`site_code`, `created_at`, `id`) COMMENT '后台申请时间分页'`
- `KEY `idx_xr_application_job` (`site_code`, `job_id`, `created_at`, `id`) COMMENT '按岗位和时间筛选申请'`
- `KEY `idx_xr_application_email_status` (`site_code`, `email_status`, `created_at`, `id`) COMMENT '按邮件状态和时间筛选申请'`
- `KEY `idx_xr_application_follow_up` (`site_code`, `follow_up_status`, `created_at`, `id`) COMMENT '按跟进状态和时间筛选申请'`
- `KEY `idx_xr_application_email` (`site_code`, `candidate_email`, `created_at`, `id`) COMMENT '按候选人邮箱精确查询'`
- `KEY `idx_xr_application_phone` (`site_code`, `phone_e164`, `created_at`, `id`) COMMENT '按完整手机号码精确查询'`
- `KEY `idx_xr_application_retention` (`retention_expires_at`, `id`) COMMENT '按保留截止时间分批清理申请'`
- `KEY `idx_xr_application_sending` (`email_status`, `sending_started_at`, `id`) COMMENT '扫描超时未决发送记录'`

### xianova_recruitment_notification_attempt

Xianova招聘邮件发送尝试与脱敏结果。

| 字段 | 类型与约束 | 中文备注 |
| --- | --- | --- |
| `id` | `bigint NOT NULL AUTO_INCREMENT` | 内部自增主键 |
| `application_id` | `bigint NOT NULL` | 所属申请内部主键，逻辑关联申请表 |
| `attempt_no` | `smallint unsigned NOT NULL` | 同申请递增的发送序号，范围为1至3 |
| `request_id` | `char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | 本次请求或操作的追踪编号 |
| `channel` | `varchar(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'EMAIL'` | 通知渠道，首期固定为邮件 |
| `smtp_account_key` | `varchar(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | 发件配置别名，仅用于追踪，不能保存密码 |
| `sender_address` | `varchar(254) NOT NULL` | 当次实际发件地址快照 |
| `recipient_address` | `varchar(254) NOT NULL` | 当次实际收件地址快照 |
| `attachment_name` | `varchar(255) NOT NULL` | 当次安全附件名称 |
| `attachment_size_bytes` | `bigint NOT NULL` | 当次附件字节大小，上限为10MiB |
| `attachment_mime_type` | `varchar(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | 当次附件经验证的文件类型 |
| `attachment_sha256` | `char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | 当次附件摘要，历史尝试不因补传覆盖 |
| `status` | `varchar(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'SENDING'` | 业务状态，取值由本表约束限定 |
| `smtp_message_id` | `varchar(255) DEFAULT NULL` | 可获得的邮件标识，不保存完整邮件头 |
| `error_code` | `varchar(64) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL` | 稳定错误码，不能包含个人正文 |
| `error_summary` | `varchar(500) DEFAULT NULL` | 白名单脱敏错误摘要，不保存原始服务端响应 |
| `started_at` | `datetime(3) NOT NULL` | 当次发送开始时间 |
| `finished_at` | `datetime(3) DEFAULT NULL` | 当次发送处理结束时间 |
| `created_at` | `datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | 记录创建时间，统一北京时间 |
| `updated_at` | `datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | 记录更新时间，统一北京时间 |

索引：

- `PRIMARY KEY (`id`)`
- `UNIQUE KEY `uk_xr_attempt_sequence` (`application_id`, `attempt_no`) COMMENT '同申请发送尝试序号唯一'`
- `KEY `idx_xr_attempt_stale` (`status`, `started_at`, `id`) COMMENT '按状态和开始时间排查发送尝试'`

### xianova_recruitment_audit_log

Xianova招聘管理操作及个人资料清理审计。

| 字段 | 类型与约束 | 中文备注 |
| --- | --- | --- |
| `id` | `bigint NOT NULL AUTO_INCREMENT` | 内部自增主键 |
| `site_code` | `varchar(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'xianova'` | 站点标识，固定为xianova |
| `target_type` | `varchar(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | 审计目标类别，岗位或申请 |
| `target_id` | `bigint NOT NULL` | 目标内部编号，允许在资料删除后短期保留删除凭据 |
| `action` | `varchar(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | 管理或清理动作，由白名单限定 |
| `operator_uid` | `int DEFAULT NULL` | 操作管理员编号，系统任务为空 |
| `request_id` | `char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | 本次请求或操作的追踪编号 |
| `change_meta` | `json DEFAULT NULL` | 仅含状态版本和数量等白名单信息，不含候选人字段 |
| `summary` | `varchar(255) DEFAULT NULL` | 后端生成的固定用途说明，不接收个人自由备注 |
| `retention_expires_at` | `datetime(3) NOT NULL` | 本记录保留截止时间，由后端可信时钟计算 |
| `created_at` | `datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | 记录创建时间，统一北京时间 |

索引：

- `PRIMARY KEY (`id`)`
- `KEY `idx_xr_audit_target` (`target_type`, `target_id`, `created_at`, `id`) COMMENT '按操作目标查询审计历史'`
- `KEY `idx_xr_audit_created` (`site_code`, `created_at`, `id`) COMMENT '站点审计时间分页'`
- `KEY `idx_xr_audit_retention` (`retention_expires_at`, `id`) COMMENT '分批清理到期审计记录'`

## 最终语言规则（2026-10-29）

需求方最终选择“英文选填，缺译显示中文”。已移除后台英文必填标记、发布禁用和后端TRANSLATION_REQUIRED校验；英文缺项及部分译文均可发布。人工英文优先，每个缺译字段独立回退中文；缺译提示同时覆盖列表、详情、申请页和后台英文预览。部门无需中英文成对填写。现发布机器人软件工程师（仅中文）和前端开发工程师（中英文完整）；旧验收岗位下线，历史申请保留。无自动翻译接口或模型，无新增数据库字段或DDL。

## 提交体验及文件名调整（2026-10-29）

- 中文上传文件名在MIME头解析前按可严格还原的UTF-8处理，兼容filename*。后台详情对原有可还原乱码进行兼容展示，不改动原始历史记录。
- 申请登记后立即返回，独立招聘内存队列后台发信；2个工作线程，最多保留4份待发送/发送中附件。容量不足时在新增申请前返回繁忙，不回退同步发送。
- 附件仍不落盘、不上传云端。用户已确认：邮件发出前服务异常重启可能丢失内存附件，后台标记需补传/未知，由HR联系候选人补交，不假装可以从数据库恢复附件。
- 同一次请求的重试仍幂等；成功后的新申请允许再次投递。保留每IP每10分钟5次上传的反滥用限制和4个并发上传限制，不引入登录要求。
- 成功页移除申请编号、邮件技术说明和重复的表单引导，保留简短成功提示。成功后清理文件和提交标识，不新增“再次投递”入口；独立结果页以2026-10-30补充规则为准。
- 联系区域不要求申请编号，也不暗示页面有补传入口。中文为“如有应聘相关问题，欢迎通过邮箱联系我们：”，英文为“For questions about your application, please contact:”，后接配置中的公开联系邮箱链接。

## 开发环境部署补充（2026-10-29）

后端运行代码`ccee460`、管理后台运行代码`6fe473d`已部署开发环境。中文姓名与岗位关键词筛选已增加回归测试并修复ASCII列与Unicode参数混查问题，不修改表字符集。开发网关补齐招聘路径前缀、11 MiB限制、413白名单跨域响应和独立可信代理配置。开发库现有四表经完整结构核对，无重复建表或Flyway历史操作。直接调用开发后端完成投递、幂等和邮件受理验证，并在开发管理后台核对详情与跟进；没有使用官网进行投递测试。完整版本、配置、证据和回滚说明见[开发环境发布记录](https://github.com/Synria-Robotics/Sparkling-Admin-Service/blob/codex/xianova-recruitment/docs/recruitment-dev-deployment.md)。

## 独立提交结果页（2026-10-30）

- 确认提交成功后进入 `/{locale}/careers/{jobId}/apply/success`，以替换历史记录的方式离开申请表单，避免浏览器后退直接回到刚提交的表单。
- 结果页主体只显示“申请已提交，感谢您的关注！”及“返回岗位列表”“返回首页”两个入口；不保留申请表单、附件上传、隐私勾选、再次投递入口或申请编号。保留官网公共页头、页脚，中英文行为一致。
- 路由跳转期间立即隐藏表单并展示相同结果内容；清理本次会话幂等凭据、文件引用和错误状态，不把候选人信息或提交 token 放入 URL。
- 刷新结果页不恢复表单，不重复提交或查询邮件状态。结果展示不依赖岗位是否仍然在招；该页不作为申请有效性的认证凭证，也不承诺邮件已送达。
- 提交失败且无法确认已登记时保留原表单；请求响应中断后，经原有状态查询确认成功，同样进入独立结果页。

## 岗位列表首屏与短缓存（2026-11-01）

- 用户确认公开岗位列表可接受约30秒更新延迟。官网服务端提前读取列表并使用30秒增量更新缓存，将岗位直接放入首屏HTML；浏览器收到初始列表后不重复请求公开列表。
- 该缓存仅覆盖已发布岗位列表，不缓存申请人信息、表单配置、投递和状态查询；提交时仍由后端实时校验岗位是否开放。
- 缓存过期后由后续访问触发后台再生成；再生成完成前可能短暂使用旧列表，网络异常时不承诺严格30秒完成同步。已有列表不会因短时故障被伪装成暂无岗位；首次无法取得列表时保留浏览器实时重试。
- 官网增加招聘域名预连接，提前建立TCP/TLS连接，帮助后续岗位详情和申请请求。该优化不改变后端邮箱、数据库、CORS或发信配置。

## 列表静默校验的最终规则（2026-11-02）

本节明确采用平衡体验方案，30秒为正常网络下的校验周期，不承诺网络故障下的强一致时限。

- 新鲜的服务端首屏不重复请求岗位；列表页可见时每30秒校验，页面隐藏时取消定时器。切回前台或获得焦点时，仅在数据过期后补查；网络恢复和手动重试可立即校验。
- 定时、焦点、可见性和重试事件共用同一请求锁；单次列表请求15秒超时，失败后仍继续后续校验。离开列表页时移除监听器、清理定时器并取消当前请求。
- 已有列表在更新中保持显示，不重置搜索条件、滚动位置或整页导航；返回内容完全相同时复用列表状态。确认下线/删除后的实时列表不再包含岗位时，局部移除该项；全部下线则正常展示暂无开放岗位。
- 后台更新失败时保留已加载内容，显示轻提示及重新加载入口；首次没有任何有效数据时展示加载失败和重试，不假装为暂无岗位。成功重试后提示消失。
- 岗位详情和申请表单不创建列表定时器，提交仍走实时后端状态校验。暂不引入SSE、后端主动缓存失效通知或新数据库表。
