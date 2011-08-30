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
package com.aimluck.controller.my.sheet

import java.util.logging.Logger
import scala.collection.mutable.ListBuffer
import org.dotme.liquidtpl.controller.AbstractJsonCommitController
import org.dotme.liquidtpl.Constants
import org.dotme.liquidtpl.LanguageUtil
import com.aimluck.lib.util.AppConstants
import com.aimluck.model.Sheet
import com.aimluck.model.SheetColumn
import com.aimluck.model.SheetMember
import com.aimluck.service.SheetMemberService
import com.aimluck.service.SheetService
import com.aimluck.service.UserDataService
import org.slim3.datastore.Datastore

class CommitController extends AbstractJsonCommitController {
  val logger = Logger.getLogger(classOf[CommitController].getName)
  override def redirectUri: String = null;

  override def validate: Boolean = {
    //Name
    val sheetName = request.getParameter("name")
    if (sheetName.size > 0 && sheetName.size > AppConstants.VALIDATE_STRING_LENGTH) {
      addError("name", LanguageUtil.get("error.stringLength", Some(Array(
        LanguageUtil.get("sheet.name"), "1", AppConstants.VALIDATE_STRING_LENGTH.toString))));
    } else if (sheetName.size == 0) {
      addError("name", LanguageUtil.get("error.required", Some(Array(
        LanguageUtil.get("sheet.name")))));
    }

    for (i <- (1 to AppConstants.DATA_LIMIT_SHEET_COLUMNS_MAX + 1)) {
      val nameField = "name_%s".format(i);
      val name = request.getParameter(nameField)
      if (name != null) {
        if (name.size > 0 && name.size > AppConstants.VALIDATE_STRING_LENGTH) {
          addError(nameField, LanguageUtil.get("error.stringLength", Some(Array(
            LanguageUtil.get("column.name"), "1", AppConstants.VALIDATE_STRING_LENGTH.toString))));
        } else if (name.size == 0) {
          addError(nameField, LanguageUtil.get("error.required", Some(Array(
            LanguageUtil.get("column.name")))));
        }

        val dataTypeField = "dataType_%s".format(i);
        val dataType = request.getParameter(dataTypeField)
        if (dataType == null || dataType.size == 0) {
          addError(dataTypeField, LanguageUtil.get("error.required", Some(Array(
            LanguageUtil.get("column.dataType")))));
        }

        if (dataType == SheetService.DataType.SELECT.toString ||
          dataType == SheetService.DataType.RADIOBUTTON.toString ||
          dataType == SheetService.DataType.CHECKBOXSET.toString) {
          val selectValuesField = "selectValues_%s".format(i);
          val selectValues = request.getParameter(dataTypeField)
          if (selectValues == null || selectValues.size == 0) {
            addError(dataTypeField, LanguageUtil.get("error.required", Some(Array(
              LanguageUtil.get("column.selectValues")))));
          }
        }

        val defaultValueField = "defaultValue_%s".format(i);
        val defaultValue = request.getParameter(defaultValueField)
        if (defaultValue != null && defaultValue.size > 0 && defaultValue.size > AppConstants.VALIDATE_LONGTEXT_LENGTH) {
          addError(defaultValueField, LanguageUtil.get("error.stringLength", Some(Array(
            LanguageUtil.get("column.defaultValue"), "1", AppConstants.VALIDATE_STRING_LENGTH.toString))));
        }
      }
    }

    val members = getMembersParameter
    if (members != null && members.size > 0 && members.size > AppConstants.DATA_LIMIT_SHEET_MEMBER_MAX) {
      addError("members", LanguageUtil.get("error.dataLimit", Some(Array(
        LanguageUtil.get("sheetMember"), AppConstants.DATA_LIMIT_SHEET_MEMBER_MAX.toString))));
    }
    !existsError
  }

  def getRelation: (String, String) = {
    UserDataService.getCurrentModel match {
      case Some(userData) => SheetService.getRelationByUserData(userData)
      case None => null
    }
  }

  def getUserName: String = {
    UserDataService.getCurrentModel match {
      case Some(userData) => userData.getName
      case None => ""
    }
  }

  def getMembersParameter: List[(Int, String, String)] = {
    val buf: ListBuffer[(Int, String, String)] = ListBuffer[(Int, String, String)]()
    for (i <- (1 to SheetMemberService.Permission.values.size + 1)) {
      val membersField = "members_%s".format(i);
      val membersText = request.getParameter(membersField)
      if (membersText != null) {
        try {
          membersText.split("\n").map { _.trim() }.foreach { member =>
            if (buf.exists(m => m._2 == member)) {
              addError("members", LanguageUtil.get("error.duplicate", Some(Array(
                LanguageUtil.get("sheetMember"), member))));
            } else {
              buf.append((request.getParameter("permission_%s".format(i)).toInt, member, member))
            }
          }
        } catch {
          case _ => addError(Constants.KEY_GLOBAL_ERROR, LanguageUtil.get("error.systemError"));
        }
      } else {
        List()
      }
    }
    buf.toList
  }

  override def update: Boolean = {
    try {
      val (relationName, relationType) = getRelation;
      val id = request.getParameter("id")
      val isNew = (id == null) || (id.size == 0)
      val sheet: Sheet = if (isNew) {
        SheetService.createNew
      } else {
        SheetService.fetchOne(id, relationName, relationType).getOrElse { null }
      }

      if (sheet != null) {
        //Name
        sheet.setName(request.getParameter("name"))
        SheetService.save(sheet, relationName, relationType)

        if (isNew) {
          val member: SheetMember = new SheetMember()
          member.setName(getUserName)
          member.setRelationName(relationName)
          member.setRelationType(relationType)
          member.getSheetRef.setModel(sheet)
          member.setPermission(SheetMemberService.Permission.ADMIN.id)
          SheetMemberService.save(member)
        } else if (!SheetMemberService.hasPermission(sheet, relationName, relationType, SheetMemberService.PermissionFlag.ADMIN)) {
          //check permission
          addError(Constants.KEY_GLOBAL_ERROR, LanguageUtil.get("error.permission"));
          return false
        }

        val columnListBuf: ListBuffer[SheetColumn] = ListBuffer[SheetColumn]()
        for (i <- (1 to AppConstants.DATA_LIMIT_SHEET_COLUMNS_MAX + 1)) {
          var isNewColumn = false
          val nameField = "name_%s".format(i);
          val name = request.getParameter(nameField)
          if (name != null) {
            val column: SheetColumn = SheetService.getColumn(sheet, i) match {
              case Some(column) => {
                isNewColumn = false
                column
              }
              case None => {
                isNewColumn = true
                SheetService.createNewColumn
              }
            }
            SheetService.setColumnParameters(i, column, request);
            if (isNewColumn) {
              columnListBuf.append(column)
            } else {
              SheetService.saveColumn(column, sheet)
            }
          }
        }
        SheetService.saveNewColumns(columnListBuf.toList, sheet)
      }

      val deleteColumns = request.getParameterValues("deleteColumns[]")
      if (deleteColumns != null) {
        deleteColumns.foreach {
          index =>
            val indexNum = index.toInt
            SheetService.getColumn(sheet, indexNum) match {
              case Some(deleteColumn) => {
                SheetService.deleteColumn(deleteColumn)
              }
              case None =>
            }
        }
      }

      val oldMembers = SheetMemberService.getMemberList(sheet)
      val keepMembers: ListBuffer[SheetMember] = ListBuffer[SheetMember]()
      getMembersParameter.filter(_._2 != relationName).foreach { member =>
        oldMembers.find(m => m.getRelationName() == member._2) match {
          case Some(oldMember) => {
            keepMembers.append(oldMember)
            oldMember.setName(member._3)
            oldMember.setRelationName(member._2)
            oldMember.setPermission(member._1)
            SheetMemberService.save(oldMember)
          }
          case None => {
            val newMember: SheetMember = new SheetMember()
            newMember.setName(member._3)
            newMember.setRelationName(member._2)
            newMember.setRelationType(relationType)
            newMember.getSheetRef.setModel(sheet)
            newMember.setPermission(member._1)
            SheetMemberService.save(newMember)
          }
        }
      }
      oldMembers.filter(m => m.getRelationName() != relationName).foreach { m =>
        if (!keepMembers.contains(m)) {
          Datastore.delete(m.getKey);
        }
      }
    } catch {
      case e: Exception =>
        logger.severe(e.getMessage())
        logger.severe(e.getStackTraceString)
        addError(Constants.KEY_GLOBAL_ERROR, LanguageUtil.get("error.systemError") + e.getMessage() + e.getStackTraceString);
    }
    !existsError
  }
}