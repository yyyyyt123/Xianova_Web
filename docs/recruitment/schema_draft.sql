-- Xianova招聘数据库设计草案，版本v2.1，日期2026-10-29。
-- 仅用于设计评审，尚未转为Flyway迁移，也未在任何数据库执行。
-- 开发库实测MySQL 8.0.36，CHECK约束要求MySQL至少为8.0.16。
-- 开发数据库为xuanya_admin_dev，本文件不包含账号密码。
-- 时间沿用现有服务的Asia/Shanghai约定，不改全局连接时区。
-- 新表显式指定utf8mb4，不修改数据库默认字符集或原有表。
-- 表间采用逻辑关联，不创建物理外键或级联删除。
-- 不使用IF NOT EXISTS隐藏同名对象，真实迁移前必须检查基线。

CREATE TABLE `xianova_recruitment_job` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '内部自增主键',
  `site_code` varchar(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'xianova' COMMENT '站点标识，固定为xianova',
  `job_code` varchar(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '创建后不可变的公开岗位编号',
  `status` varchar(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'DRAFT' COMMENT '业务状态，取值由本表约束限定',
  `draft_payload` json NOT NULL COMMENT '经过结构校验的完整岗位草稿，结构版本为1',
  `published_payload` json DEFAULT NULL COMMENT '仅明确发布时更新的完整公开岗位快照',
  `draft_revision` int NOT NULL DEFAULT 1 COMMENT '当前草稿版本，每次保存递增',
  `published_revision` int DEFAULT NULL COMMENT '最近发布时对应的草稿版本',
  `row_version` int NOT NULL DEFAULT 0 COMMENT '乐观锁版本，每次业务变更递增',
  `published_title_zh` varchar(200) DEFAULT NULL COMMENT '已发布中文岗位名称',
  `published_title_en` varchar(200) DEFAULT NULL COMMENT '已发布英文岗位名称',
  `published_department` varchar(100) DEFAULT NULL COMMENT '已发布岗位所属部门',
  `published_category` varchar(64) DEFAULT NULL COMMENT '已发布岗位类别',
  `published_location` varchar(200) DEFAULT NULL COMMENT '已发布岗位地点',
  `published_employment_type` varchar(32) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL COMMENT '已发布招聘类型',
  `published_sort_order` int NOT NULL DEFAULT 0 COMMENT '已发布排序值，数字较小的优先',
  `created_by_uid` int NOT NULL COMMENT '创建管理员编号，逻辑关联用户表uid',
  `updated_by_uid` int NOT NULL COMMENT '最近编辑管理员编号',
  `published_by_uid` int DEFAULT NULL COMMENT '最近发布管理员编号',
  `published_at` datetime(3) DEFAULT NULL COMMENT '最近明确发布的时间',
  `offline_at` datetime(3) DEFAULT NULL COMMENT '最近下线时间，重新发布时清空',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '记录创建时间，统一北京时间',
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '记录更新时间，统一北京时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_xr_job_code` (`site_code`, `job_code`) COMMENT '同站点岗位编号唯一',
  KEY `idx_xr_job_public` (`site_code`, `status`, `published_sort_order`, `id`) COMMENT '公开岗位状态及稳定排序查询',
  KEY `idx_xr_job_category` (`site_code`, `status`, `published_category`, `published_sort_order`, `id`) COMMENT '公开岗位类别筛选与排序',
  CONSTRAINT `ck_xr_job_site` CHECK (`site_code` = 'xianova'),
  CONSTRAINT `ck_xr_job_status` CHECK (`status` IN ('DRAFT', 'PUBLISHED', 'OFFLINE')),
  CONSTRAINT `ck_xr_job_versions` CHECK (
    `draft_revision` >= 1 AND `row_version` >= 0 AND
    (`published_revision` IS NULL OR (`published_revision` >= 1 AND `published_revision` <= `draft_revision`))
  ),
  CONSTRAINT `ck_xr_job_payload` CHECK (
    JSON_TYPE(`draft_payload`) = 'OBJECT' AND
    (`published_payload` IS NULL OR JSON_TYPE(`published_payload`) = 'OBJECT')
  ),
  CONSTRAINT `ck_xr_job_public_snapshot` CHECK (
    (`status` = 'DRAFT' AND `published_payload` IS NULL AND `published_revision` IS NULL) OR
    (`status` IN ('PUBLISHED', 'OFFLINE') AND `published_payload` IS NOT NULL
      AND `published_revision` IS NOT NULL AND `published_title_zh` IS NOT NULL
      AND CHAR_LENGTH(`published_title_zh`) > 0 AND `published_location` IS NOT NULL
      AND `published_employment_type` IS NOT NULL AND `published_at` IS NOT NULL
      AND `published_by_uid` IS NOT NULL)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Xianova招聘岗位草稿与发布快照';

CREATE TABLE `xianova_recruitment_application` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '内部自增主键',
  `application_no` char(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '随机公开申请编号，本身不具备授权能力',
  `site_code` varchar(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'xianova' COMMENT '站点标识，固定为xianova',
  `job_id` bigint NOT NULL COMMENT '岗位内部主键，逻辑关联岗位表',
  `job_code_snapshot` varchar(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '提交时的稳定岗位编号快照',
  `job_published_revision` int NOT NULL COMMENT '提交时的岗位发布版本',
  `job_snapshot` json NOT NULL COMMENT '提交时完整岗位公开内容快照',
  `candidate_name` varchar(100) NOT NULL COMMENT '候选人姓名',
  `candidate_email` varchar(254) NOT NULL COMMENT '候选人邮箱，不作为唯一申请标识',
  `phone_country_code` varchar(4) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '含加号的手机国家区号',
  `phone_national_number` varchar(15) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '规范化后的本地手机号码',
  `phone_e164` varchar(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '含国家码的完整手机号码，供精确查询',
  `message` varchar(2000) DEFAULT NULL COMMENT '候选人补充说明',
  `resume_original_name` varchar(255) NOT NULL COMMENT '最近接收简历的原始文件名',
  `resume_attachment_name` varchar(255) NOT NULL COMMENT '最近接收简历的安全附件名称，不是文件路径',
  `resume_size_bytes` bigint NOT NULL COMMENT '最近接收简历的字节大小，上限为10MiB',
  `resume_mime_type` varchar(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '最近接收简历经验证的文件类型',
  `resume_sha256` char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '最近接收简历的摘要，不保存文件内容',
  `privacy_accepted` tinyint NOT NULL COMMENT '隐私告知主动确认结果，必须为1',
  `privacy_version` varchar(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '提交时招聘隐私告知版本',
  `privacy_snapshot` json NOT NULL COMMENT '当时展示的告知正文及联系信息快照',
  `privacy_accepted_at` datetime(3) NOT NULL COMMENT '后端记录的告知确认时间',
  `idempotency_key` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '初次提交的标准小写UUID幂等键',
  `request_fingerprint` char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '初次规范化表单和原始文件的指纹，补传不改写',
  `submission_token_hash` char(64) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL COMMENT '当前会话凭据的安全摘要，不保存明文',
  `token_expires_at` datetime(3) DEFAULT NULL COMMENT '会话凭据到期时间，到期撤销时可清空',
  `email_status` varchar(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'PENDING' COMMENT '申请当前邮件状态，不等于送达或已读',
  `follow_up_status` varchar(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'NEW' COMMENT '管理跟进状态，独立于邮件状态',
  `follow_up_note` varchar(2000) DEFAULT NULL COMMENT '管理员跟进备注，随个人资料一同清理',
  `follow_up_by_uid` int DEFAULT NULL COMMENT '最近跟进管理员编号',
  `follow_up_at` datetime(3) DEFAULT NULL COMMENT '最近跟进时间',
  `attempt_count` smallint unsigned NOT NULL DEFAULT 0 COMMENT '已预留发送次数，包含失败和未知，最多3次',
  `sending_attempt_id` bigint DEFAULT NULL COMMENT '当前发送尝试主键，作为条件更新隔离标识',
  `sending_started_at` datetime(3) DEFAULT NULL COMMENT '当前发送开始时间，供异常扫描',
  `last_attempt_at` datetime(3) DEFAULT NULL COMMENT '最近一次预留发送的时间',
  `retry_after_at` datetime(3) DEFAULT NULL COMMENT '允许再次发送的最早时间',
  `retention_expires_at` datetime(3) NOT NULL COMMENT '本记录保留截止时间，由后端可信时钟计算',
  `row_version` int NOT NULL DEFAULT 0 COMMENT '乐观锁版本，每次业务变更递增',
  `request_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '本次请求或操作的追踪编号',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '记录创建时间，统一北京时间',
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '记录更新时间，统一北京时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_xr_application_no` (`application_no`) COMMENT '公开申请编号唯一',
  UNIQUE KEY `uk_xr_application_idempotency` (`site_code`, `idempotency_key`) COMMENT '同站点提交幂等键唯一',
  KEY `idx_xr_application_created` (`site_code`, `created_at`, `id`) COMMENT '后台申请时间分页',
  KEY `idx_xr_application_job` (`site_code`, `job_id`, `created_at`, `id`) COMMENT '按岗位和时间筛选申请',
  KEY `idx_xr_application_email_status` (`site_code`, `email_status`, `created_at`, `id`) COMMENT '按邮件状态和时间筛选申请',
  KEY `idx_xr_application_follow_up` (`site_code`, `follow_up_status`, `created_at`, `id`) COMMENT '按跟进状态和时间筛选申请',
  KEY `idx_xr_application_email` (`site_code`, `candidate_email`, `created_at`, `id`) COMMENT '按候选人邮箱精确查询',
  KEY `idx_xr_application_phone` (`site_code`, `phone_e164`, `created_at`, `id`) COMMENT '按完整手机号码精确查询',
  KEY `idx_xr_application_retention` (`retention_expires_at`, `id`) COMMENT '按保留截止时间分批清理申请',
  KEY `idx_xr_application_sending` (`email_status`, `sending_started_at`, `id`) COMMENT '扫描超时未决发送记录',
  CONSTRAINT `ck_xr_application_site` CHECK (`site_code` = 'xianova'),
  CONSTRAINT `ck_xr_application_job_revision` CHECK (`job_published_revision` >= 1),
  CONSTRAINT `ck_xr_application_json` CHECK (
    JSON_TYPE(`job_snapshot`) = 'OBJECT' AND JSON_TYPE(`privacy_snapshot`) = 'OBJECT'
  ),
  CONSTRAINT `ck_xr_application_resume_size` CHECK (`resume_size_bytes` > 0 AND `resume_size_bytes` <= 10485760),
  CONSTRAINT `ck_xr_application_privacy` CHECK (`privacy_accepted` = 1),
  CONSTRAINT `ck_xr_application_phone` CHECK (CHAR_LENGTH(`phone_e164`) BETWEEN 7 AND 16),
  CONSTRAINT `ck_xr_application_email_status` CHECK (
    `email_status` IN ('PENDING', 'SENDING', 'SMTP_ACCEPTED', 'FAILED', 'UNKNOWN', 'REUPLOAD_REQUIRED')
  ),
  CONSTRAINT `ck_xr_application_follow_up` CHECK (`follow_up_status` IN ('NEW', 'CONTACTED', 'CLOSED')),
  CONSTRAINT `ck_xr_application_attempts` CHECK (`attempt_count` <= 3 AND `row_version` >= 0),
  CONSTRAINT `ck_xr_application_sending_fence` CHECK (
    `email_status` <> 'SENDING' OR (`sending_attempt_id` IS NOT NULL AND `sending_started_at` IS NOT NULL)
  ),
  CONSTRAINT `ck_xr_application_token_pair` CHECK (
    (`submission_token_hash` IS NULL AND `token_expires_at` IS NULL) OR
    (`submission_token_hash` IS NOT NULL AND `token_expires_at` IS NOT NULL)
  ),
  CONSTRAINT `ck_xr_application_retention` CHECK (`retention_expires_at` > `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Xianova应聘申请及附件元信息，不保存简历内容';

CREATE TABLE `xianova_recruitment_notification_attempt` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '内部自增主键',
  `application_id` bigint NOT NULL COMMENT '所属申请内部主键，逻辑关联申请表',
  `attempt_no` smallint unsigned NOT NULL COMMENT '同申请递增的发送序号，范围为1至3',
  `request_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '本次请求或操作的追踪编号',
  `channel` varchar(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'EMAIL' COMMENT '通知渠道，首期固定为邮件',
  `smtp_account_key` varchar(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '发件配置别名，仅用于追踪，不能保存密码',
  `sender_address` varchar(254) NOT NULL COMMENT '当次实际发件地址快照',
  `recipient_address` varchar(254) NOT NULL COMMENT '当次实际收件地址快照',
  `attachment_name` varchar(255) NOT NULL COMMENT '当次安全附件名称',
  `attachment_size_bytes` bigint NOT NULL COMMENT '当次附件字节大小，上限为10MiB',
  `attachment_mime_type` varchar(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '当次附件经验证的文件类型',
  `attachment_sha256` char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '当次附件摘要，历史尝试不因补传覆盖',
  `status` varchar(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'SENDING' COMMENT '业务状态，取值由本表约束限定',
  `smtp_message_id` varchar(255) DEFAULT NULL COMMENT '可获得的邮件标识，不保存完整邮件头',
  `error_code` varchar(64) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL COMMENT '稳定错误码，不能包含个人正文',
  `error_summary` varchar(500) DEFAULT NULL COMMENT '白名单脱敏错误摘要，不保存原始服务端响应',
  `started_at` datetime(3) NOT NULL COMMENT '当次发送开始时间',
  `finished_at` datetime(3) DEFAULT NULL COMMENT '当次发送处理结束时间',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '记录创建时间，统一北京时间',
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '记录更新时间，统一北京时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_xr_attempt_sequence` (`application_id`, `attempt_no`) COMMENT '同申请发送尝试序号唯一',
  KEY `idx_xr_attempt_stale` (`status`, `started_at`, `id`) COMMENT '按状态和开始时间排查发送尝试',
  CONSTRAINT `ck_xr_attempt_number` CHECK (`attempt_no` BETWEEN 1 AND 3),
  CONSTRAINT `ck_xr_attempt_channel` CHECK (`channel` = 'EMAIL'),
  CONSTRAINT `ck_xr_attempt_status` CHECK (`status` IN ('SENDING', 'SMTP_ACCEPTED', 'FAILED', 'UNKNOWN')),
  CONSTRAINT `ck_xr_attempt_size` CHECK (`attachment_size_bytes` > 0 AND `attachment_size_bytes` <= 10485760),
  CONSTRAINT `ck_xr_attempt_time` CHECK (`finished_at` IS NULL OR `finished_at` >= `started_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Xianova招聘邮件发送尝试与脱敏结果';

CREATE TABLE `xianova_recruitment_audit_log` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '内部自增主键',
  `site_code` varchar(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'xianova' COMMENT '站点标识，固定为xianova',
  `target_type` varchar(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '审计目标类别，岗位或申请',
  `target_id` bigint NOT NULL COMMENT '目标内部编号，允许在资料删除后短期保留删除凭据',
  `action` varchar(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '管理或清理动作，由白名单限定',
  `operator_uid` int DEFAULT NULL COMMENT '操作管理员编号，系统任务为空',
  `request_id` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT '本次请求或操作的追踪编号',
  `change_meta` json DEFAULT NULL COMMENT '仅含状态版本和数量等白名单信息，不含候选人字段',
  `summary` varchar(255) DEFAULT NULL COMMENT '后端生成的固定用途说明，不接收个人自由备注',
  `retention_expires_at` datetime(3) NOT NULL COMMENT '本记录保留截止时间，由后端可信时钟计算',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '记录创建时间，统一北京时间',
  PRIMARY KEY (`id`),
  KEY `idx_xr_audit_target` (`target_type`, `target_id`, `created_at`, `id`) COMMENT '按操作目标查询审计历史',
  KEY `idx_xr_audit_created` (`site_code`, `created_at`, `id`) COMMENT '站点审计时间分页',
  KEY `idx_xr_audit_retention` (`retention_expires_at`, `id`) COMMENT '分批清理到期审计记录',
  CONSTRAINT `ck_xr_audit_site` CHECK (`site_code` = 'xianova'),
  CONSTRAINT `ck_xr_audit_target` CHECK (`target_type` IN ('JOB', 'APPLICATION')),
  CONSTRAINT `ck_xr_audit_action` CHECK (
    `action` IN ('JOB_CREATE', 'JOB_UPDATE', 'JOB_PUBLISH', 'JOB_OFFLINE',
      'APPLICATION_FOLLOW_UP', 'PERSONAL_DATA_ERASE', 'RETENTION_ERASE')
  ),
  CONSTRAINT `ck_xr_audit_meta` CHECK (`change_meta` IS NULL OR JSON_TYPE(`change_meta`) = 'OBJECT'),
  CONSTRAINT `ck_xr_audit_retention` CHECK (`retention_expires_at` > `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Xianova招聘管理操作及个人资料清理审计';
