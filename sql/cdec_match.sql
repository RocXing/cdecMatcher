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

Date: 2017-03-03 16:16:12
*/


-- ----------------------------
-- Table structure for cdec_match
-- ----------------------------
DROP TABLE IF EXISTS "public"."cdec_match";
CREATE TABLE "public"."cdec_match" (
"id" char(32) COLLATE "default" DEFAULT replace(((uuid_generate_v1())::character varying)::text, '-'::text, ''::text) NOT NULL,
"number" int8,
"description" varchar(255) COLLATE "default",
"time" timestamptz(6) DEFAULT now() NOT NULL,
"valid" bool DEFAULT false NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Alter Sequences Owned By 
-- ----------------------------

-- ----------------------------
-- Primary Key structure for table cdec_match
-- ----------------------------
ALTER TABLE "public"."cdec_match" ADD PRIMARY KEY ("id");
