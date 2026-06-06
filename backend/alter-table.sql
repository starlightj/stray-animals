-- 校园流浪动物管理系统
-- 数据库升级脚本：为 animals 表增加 animal_type 字段

-- 切换到目标数据库
USE campus_animal;

-- 增加 animal_type 列，用于存储 AI 识别的结果（猫/狗）
-- VARCHAR(10) 足够存储 "猫"、"狗"、"不确定" 等值
-- 允许空值以兼容旧数据
ALTER TABLE animals
ADD COLUMN animal_type VARCHAR(10) DEFAULT NULL COMMENT 'AI识别结果：猫/狗/不确定';

-- 验证列已添加
DESCRIBE animals;
