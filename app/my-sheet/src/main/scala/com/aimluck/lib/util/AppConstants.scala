/*
 * This file is part of official Aipo App.
 * Copyright (C) 2011-2011 Aimluck,Inc.
 * http://www.aipo.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package com.aimluck.lib.util

import java.io.File
import java.io.FileNotFoundException
import java.text.DateFormat
import java.text.SimpleDateFormat
import java.util.TimeZone
import org.dotme.liquidtpl.LanguageUtil

object AppConstants {
  val CONFIG_FOLDER = "contents"
  val CONFIG_FILE = "app"
  val SYSTEM_TIME_ZONE: TimeZone = TimeZone.getTimeZone("GMT-8:00")

  // settings for validate
  val VALIDATE_STRING_LENGTH = 100
  val VALIDATE_LONGTEXT_LENGTH = 400

  // settings for check-alive
  val DEFAULT_SENDER = "%s <yusuke.takase.al@gmail.com>".format(LanguageUtil.get("title"))
  val DEFAULT_TIMEOUT_SECONDS = 120
  val DATA_LIMIT_SHEET_COLUMNS_MAX = 255
  val DATA_LIMIT_SHEET_ITEM_MAX = 255
  val DATA_LIMIT_SHEET_MEMBER_MAX = 30

  val RESULTS_PER_PAGE: Int = 20
  val RESULTS_PER_TASK: Int = 10

  private def configPath: String = {
    try {
      CONFIG_FOLDER + File.separator + CONFIG_FILE
    } catch {
      case e: FileNotFoundException => "."
    }
  }

  private val DEFAULT_TIME_ZONE: TimeZone = TimeZone.getTimeZone("Asia/Tokyo")
  def timeZone: TimeZone = DEFAULT_TIME_ZONE;

  def dayCountFormat: DateFormat = {
    val dateFormat: DateFormat = new SimpleDateFormat("yyyyMMdd")
    dateFormat.setTimeZone(AppConstants.SYSTEM_TIME_ZONE)
    dateFormat
  }

  def dayCountFormatWithTimeZone(timeZone: TimeZone): DateFormat = {
    val dateFormat: DateFormat = new SimpleDateFormat("yyyyMMdd")
    dateFormat.setTimeZone(timeZone)
    dateFormat
  }

  def timeFormat: DateFormat = {
    val dateFormat: DateFormat = new SimpleDateFormat("HH:mm")
    dateFormat.setTimeZone(AppConstants.timeZone)
    dateFormat
  }

  def dateFormat: DateFormat = {
    val dateFormat: DateFormat = new SimpleDateFormat("yyyy/MM/dd")
    dateFormat.setTimeZone(AppConstants.timeZone)
    dateFormat
  }

  def dateTimeFormat: DateFormat = {
    val dateFormat: DateFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm")
    dateFormat.setTimeZone(AppConstants.timeZone)
    dateFormat
  }

}