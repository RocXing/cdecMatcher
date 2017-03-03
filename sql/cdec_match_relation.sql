/*
Navicat PGSQL Data Transfer

Source Server         : cdecMatcher
Source Server Version : 90506
Source Host           : localhost:5432
Source Database       : cdecmatcher
Source Schema         : public

Target Server Type    : PGSQL
Target Server Version : 90506
File Encoding         : 65001

Date: 2017-03-03 16:16:20
*/


-- ----------------------------
-- Table structure for cdec_match_relation
-- ----------------------------
DROP TABLE IF EXISTS "public"."cdec_match_relation";
CREATE TABLE "public"."cdec_match_relation" (
"id" char(32) COLLATE "default" DEFAULT replace(((uuid_generate_v1())::character varying)::text, '-'::text, ''::text) NOT NULL,
"participant_id" char(32) COLLATE "default" NOT NULL,
"match_id" char(32) COLLATE "default" NOT NULL,
"result" bool,
"delta" varchar(32) COLLATE "default",
"team" int2 NOT NULL
)
WITH (OIDS=FALSE)

;
COMMENT ON COLUMN "public"."cdec_match_relation"."result" IS 'false lose true win';
COMMENT ON COLUMN "public"."cdec_match_relation"."team" IS '0 or 1';

-- ----------------------------
-- Alter Sequences Owned By 
-- ----------------------------

-- ----------------------------
-- Primary Key structure for table cdec_match_relation
-- ----------------------------
ALTER TABLE "public"."cdec_match_relation" ADD PRIMARY KEY ("id");
