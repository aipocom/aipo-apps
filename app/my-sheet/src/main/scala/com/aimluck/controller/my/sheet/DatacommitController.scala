package com.aimluck.controller.my.sheet

import org.slim3.controller.Controller
import org.slim3.controller.Navigation
import org.dotme.liquidtpl.controller.AbstractJsonCommitController
import org.dotme.liquidtpl.LanguageUtil
import org.dotme.liquidtpl.Constants
import java.util.logging.Logger
import com.aimluck.lib.util.AppConstants
import com.aimluck.service.SheetService
import com.aimluck.model.Sheet
import com.google.appengine.api.datastore.KeyFactory
import com.aimluck.service.UserDataService
import com.aimluck.model.SheetMember
import org.slim3.datastore.Datastore
import scala.collection.JavaConversions._
import com.aimluck.model.SheetColumn
import scala.collection.mutable.ListBuffer
import com.google.appengine.api.datastore.Entity
import com.aimluck.service.SheetDataService
import com.aimluck.service.SheetMemberService

class DatacommitController extends AbstractJsonCommitController {
  val logger = Logger.getLogger(classOf[DatacommitController].getName)
  override def redirectUri: String = null;

  override def validate: Boolean = {
    //Name
    val (relationName, relationType) = getRelation;
    val sheetKey = request.getParameter(SheetService.KEY_SHEET_KEY)
    SheetService.fetchOne(sheetKey, relationName, relationType) match {
      case Some(sheet) =>
        SheetService.getColumnList(sheet) foreach { column =>
          val valueString = request.getParameter(column.getColumnName())
          val valueArray = request.getParameterValues("%s[]".format(column.getColumnName()))
          val required = column.isRequired()
          if (column.getDataType() == SheetService.DataType.TEXT.toString()) {
            if (valueString.size > 0 && valueString.size > AppConstants.VALIDATE_STRING_LENGTH) {
              addError(column.getColumnName(), LanguageUtil.get("error.stringLength", Some(Array(
                column.getName(), "1", AppConstants.VALIDATE_STRING_LENGTH.toString))));
            } else if (required && valueString.size == 0) {
              addError(column.getColumnName(), LanguageUtil.get("error.required", Some(Array(
                column.getName()))));
            }
          } else if (column.getDataType() == SheetService.DataType.LONGTEXT.toString()) {
            if (valueString.size > 0 && valueString.size > AppConstants.VALIDATE_LONGTEXT_LENGTH) {
              addError(column.getColumnName(), LanguageUtil.get("error.stringLength", Some(Array(
                column.getName(), "1", AppConstants.VALIDATE_STRING_LENGTH.toString))));
            } else if (required && valueString.size == 0) {
              addError(column.getColumnName(), LanguageUtil.get("error.required", Some(Array(
                column.getName()))));
            }
          } else if (column.getDataType() == SheetService.DataType.NUMBER.toString()) {
            try {
              valueString.toInt
            } catch {
              case _ =>
                addError(column.getColumnName(), LanguageUtil.get("error.invaldValue", Some(Array(
                  column.getName(), "1", AppConstants.VALIDATE_STRING_LENGTH.toString))));
            }
            if (required && valueString.size == 0) {
              addError(column.getColumnName(), LanguageUtil.get("error.required", Some(Array(
                column.getName()))));
            }
          } else if (column.getDataType() == SheetService.DataType.SELECT.toString()) {
            if (!column.getSelectValues().contains(valueString)) {
              addError(column.getColumnName(), LanguageUtil.get("error.invaldValue", Some(Array(
                column.getName(), "1", AppConstants.VALIDATE_STRING_LENGTH.toString))));
            } else if (required && valueString.size == 0) {
              addError(column.getColumnName(), LanguageUtil.get("error.required", Some(Array(
                column.getName()))));
            }
          } else if (column.getDataType() == SheetService.DataType.RADIOBUTTON.toString()) {
            if (!column.getSelectValues().contains(valueString)) {
              addError(column.getColumnName(), LanguageUtil.get("error.invaldValue", Some(Array(
                column.getName(), "1", AppConstants.VALIDATE_STRING_LENGTH.toString))));
            } else if (required && valueString.size == 0) {
              addError(column.getColumnName(), LanguageUtil.get("error.required", Some(Array(
                column.getName()))));
            }
          } else if (column.getDataType() == SheetService.DataType.CHECKBOX.toString()) {
            if (valueString != null && valueString != true.toString) {
              addError(column.getColumnName(), LanguageUtil.get("error.invaldValue", Some(Array(
                column.getName(), "1", AppConstants.VALIDATE_STRING_LENGTH.toString))));
            }
          } else if (column.getDataType() == SheetService.DataType.CHECKBOXSET.toString()) {
            valueArray.foreach { _valueString =>
              if (!column.getSelectValues().contains(_valueString)) {
                addError(column.getColumnName(), LanguageUtil.get("error.invaldValue", Some(Array(
                  column.getName(), "1", AppConstants.VALIDATE_STRING_LENGTH.toString))));
              }
            }
            if (required && valueArray.size == 0) {
              addError(column.getColumnName(), LanguageUtil.get("error.required", Some(Array(
                column.getName()))));
            }
          } else if (column.getDataType() == SheetService.DataType.DATE.toString()) {
            try {
              AppConstants.dateFormat.parse(valueString)
            } catch {
              case _ =>
                addError(column.getColumnName(), LanguageUtil.get("error.invaldValue", Some(Array(
                  column.getName(), "1", AppConstants.VALIDATE_STRING_LENGTH.toString))));
            }
            if (required && valueString.size == 0) {
              addError(column.getColumnName(), LanguageUtil.get("error.required", Some(Array(
                column.getName()))));
            }
          } else if (column.getDataType() == SheetService.DataType.DATETIME.toString()) {
            try {
              AppConstants.dateTimeFormat.parse(valueString)
            } catch {
              case _ =>
                addError(column.getColumnName(), LanguageUtil.get("error.invaldValue", Some(Array(
                  column.getName(), "1", AppConstants.VALIDATE_STRING_LENGTH.toString))));
            }
            if (required && valueString.size == 0) {
              addError(column.getColumnName(), LanguageUtil.get("error.required", Some(Array(
                column.getName()))));
            }
          } else {
          }
        }
      case None =>
        addError(Constants.KEY_GLOBAL_ERROR, LanguageUtil.get("error.systemError"));
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

  override def update: Boolean = {
    try {
      val (relationName, relationType) = getRelation;
      val sheetKey = request.getParameter(SheetService.KEY_SHEET_KEY)

      SheetService.fetchOne(sheetKey, relationName, relationType) match {
        case Some(sheet) =>
          {
            val id = request.getParameter("id")
            val isNew = (id == null) || (id.size == 0)
            val data: Entity = if (isNew) {
              SheetDataService.createNew(sheet)
            } else {
              SheetDataService.fetchOne(id, sheet, relationName, relationType).getOrElse { null }
            }

            if (data != null) {
              val hasPermission: Boolean = if (isNew) {
                SheetMemberService.hasPermission(sheet, relationName, relationType, SheetMemberService.PermissionFlag.MODIFY_MY_DATA)
              } else {
                if (SheetDataService.isOwner(data, relationName, relationType)) {
                  SheetMemberService.hasPermission(sheet, relationName, relationType, SheetMemberService.PermissionFlag.MODIFY_MY_DATA)
                } else {
                  SheetMemberService.hasPermission(sheet, relationName, relationType, SheetMemberService.PermissionFlag.MODIFY_OTHERS_DATA)
                }
              }
              if (!hasPermission) {
                addError(Constants.KEY_GLOBAL_ERROR, LanguageUtil.get("error.permission"));
                return false
              }

              SheetService.getColumnList(sheet) foreach { column =>
                val valueString = request.getParameter(column.getColumnName())
                val valueArray = request.getParameterValues("%s[]".format(column.getColumnName()))
                val required = column.isRequired
                if (column.getDataType() == SheetService.DataType.TEXT.toString()) {
                  data.setProperty(column.getColumnName(), valueString)
                } else if (column.getDataType() == SheetService.DataType.LONGTEXT.toString()) {
                  data.setProperty(column.getColumnName(), valueString)
                } else if (column.getDataType() == SheetService.DataType.NUMBER.toString()) {
                  try {
                    data.setProperty(column.getColumnName(), valueString.toInt)
                  } catch {
                    case _ =>
                      addError(column.getColumnName(), LanguageUtil.get("error.invaldValue", Some(Array(
                        column.getName(), "1", AppConstants.VALIDATE_STRING_LENGTH.toString))));
                  }
                } else if (column.getDataType() == SheetService.DataType.SELECT.toString()) {
                  data.setProperty(column.getColumnName(), valueString)
                } else if (column.getDataType() == SheetService.DataType.RADIOBUTTON.toString()) {
                  data.setProperty(column.getColumnName(), valueString)
                } else if (column.getDataType() == SheetService.DataType.CHECKBOX.toString()) {
                  data.setProperty(column.getColumnName(), valueString)
                } else if (column.getDataType() == SheetService.DataType.CHECKBOXSET.toString()) {
                  val _valueString = valueArray.flatMap {
                    "%s\n".format(_)
                  }
                  data.setProperty(column.getColumnName(), _valueString)
                } else if (column.getDataType() == SheetService.DataType.DATE.toString()) {
                  try {
                    data.setProperty(column.getColumnName(), AppConstants.dateFormat.parse(valueString))
                  } catch {
                    case _ =>
                      addError(column.getColumnName(), LanguageUtil.get("error.invaldValue", Some(Array(
                        column.getName(), "1", AppConstants.VALIDATE_STRING_LENGTH.toString))));
                  }
                } else if (column.getDataType() == SheetService.DataType.DATETIME.toString()) {
                  try {
                    data.setProperty(column.getColumnName(), AppConstants.dateTimeFormat.parse(valueString))
                  } catch {
                    case _ =>
                      addError(column.getColumnName(), LanguageUtil.get("error.invaldValue", Some(Array(
                        column.getName(), "1", AppConstants.VALIDATE_STRING_LENGTH.toString))));
                  }
                } else {
                }
              }
              SheetDataService.save(data, sheet, relationName, relationType, isNew)
            } else {
              addError(Constants.KEY_GLOBAL_ERROR, LanguageUtil.get("error.dataNotFound"))
            }
          }
        case None => {
          addError(Constants.KEY_GLOBAL_ERROR, LanguageUtil.get("error.dataNotFound"))
        }
      }
    } catch {
      case e: Exception =>
        logger.severe(e.getMessage())
        logger.severe(e.getStackTraceString)
        addError(Constants.KEY_GLOBAL_ERROR, LanguageUtil.get("error.systemError"));
    }
    !existsError
  }
}