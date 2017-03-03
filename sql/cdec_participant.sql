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

Date: 2017-03-03 16:16:29
*/


-- ----------------------------
-- Table structure for cdec_participant
-- ----------------------------
DROP TABLE IF EXISTS "public"."cdec_participant";
CREATE TABLE "public"."cdec_participant" (
"id" char(32) COLLATE "default" DEFAULT replace(((uuid_generate_v1())::character varying)::text, '-'::text, ''::text) NOT NULL,
"name" varchar(255) COLLATE "default" NOT NULL,
"description" varchar(255) COLLATE "default",
"score" int4 DEFAULT 1000 NOT NULL,
"head" varchar(255) COLLATE "default",
"times" int4 DEFAULT 0 NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Alter Sequences Owned By 
-- ----------------------------

-- ----------------------------
-- Uniques structure for table cdec_participant
-- ----------------------------
ALTER TABLE "public"."cdec_participant" ADD UNIQUE ("name");

-- ----------------------------
-- Primary Key structure for table cdec_participant
-- ----------------------------
ALTER TABLE "public"."cdec_participant" ADD PRIMARY KEY ("id");
