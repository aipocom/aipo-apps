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

package com.aimluck.service
import java.util.logging.Logger
import java.util.Date

import scala.collection.JavaConversions._
import scala.collection.mutable.LinkedHashMap
import scala.collection.mutable.MapBuilder
import scala.collection.mutable.MapBuilder
import scala.collection.mutable.MapBuilder
import scala.collection.mutable.MapBuilder
import scala.collection.mutable.MapBuilder
import scala.collection.mutable.MapBuilder
import scala.collection.mutable.MapBuilder

import org.dotme.liquidtpl.LanguageUtil
import org.slim3.datastore.Datastore
import org.slim3.datastore.ModelQuery

import com.aimluck.meta.SheetMemberMeta
import com.aimluck.model.Sheet
import com.aimluck.model.SheetMember
import com.google.appengine.api.datastore._
import com.google.appengine.api.datastore.Key

object SheetMemberService {
  val logger = Logger.getLogger(SheetMemberService.getClass.getName)
  object PermissionFlag extends Enumeration {
    val VIEW_MY_DATA = Value(2, "view_my_data")
    val MODIFY_MY_DATA = Value(4, "modify_my_data")
    val VIEW_OTHERS_DATA = Value(8, "view_others_data")
    val MODIFY_OTHERS_DATA = Value(16, "modify_others_data")
    val ADMIN = Value(1, "admin")
  }

  object Permission extends Enumeration {
    val GUEST = Value(PermissionFlag.VIEW_MY_DATA.id
      | PermissionFlag.MODIFY_MY_DATA.id, "guest")
    val VIEWER = Value(PermissionFlag.VIEW_MY_DATA.id
      | PermissionFlag.VIEW_OTHERS_DATA.id, "viewer")
    val GENERAL = Value(PermissionFlag.VIEW_MY_DATA.id
      | PermissionFlag.MODIFY_MY_DATA.id
      | PermissionFlag.VIEW_OTHERS_DATA.id, "general")
    val POWER = Value(PermissionFlag.VIEW_MY_DATA.id
      | PermissionFlag.MODIFY_MY_DATA.id
      | PermissionFlag.VIEW_OTHERS_DATA.id
      | PermissionFlag.MODIFY_OTHERS_DATA.id, "power")
    val ADMIN = Value(PermissionFlag.VIEW_MY_DATA.id
      | PermissionFlag.MODIFY_MY_DATA.id
      | PermissionFlag.VIEW_OTHERS_DATA.id
      | PermissionFlag.MODIFY_OTHERS_DATA.id
      | PermissionFlag.ADMIN.id, "admin")
  }

  def hasPermission(permission: Int, flag: PermissionFlag.Value): Boolean = {
    (permission & flag.id) > 0
  }
  
  def hasPermission(sheet: Sheet, relationName:String, relationType:String, flag: PermissionFlag.Value): Boolean = {
    fetchOne(sheet, relationName, relationType) match {
      case Some(member) => hasPermission(member.getPermission, flag)
      case None => false
    }    
  }

  def save(model: SheetMember): Key = {
    val key: Key = model.getKey
    val now: Date = new Date
    if (key == null) {
      model.setCreatedAt(now)
    }
    Datastore.put(model)
  }

  def permissionMemberMap(members: List[SheetMember]): Map[Int, List[String]] = {
    var map: scala.collection.mutable.Map[Int, List[String]] = scala.collection.mutable.Map[Int, List[String]]()
    members.foreach { member =>
      val permission = member.getPermission();
      if (!map.containsKey(permission)) {
        map.put(permission, List({ member.getRelationName() }))
      } else {
        map.put(permission,  map.apply(permission) ++ List({ member.getRelationName() }))
      }
    }
    map.toMap
  }

  val permissionPair: List[(Int, String)] = {
    Permission.values.map { value =>
      (value.id, LanguageUtil.get("permission." + value.toString()))
    }.toList.sortWith((x, y) => x._1 < y._1)
  }

  def getMemberList(sheet: Sheet): List[SheetMember] = {
    val mm: SheetMemberMeta = SheetMemberMeta.get
    Datastore.query(mm).filter(mm.sheetRef.equal(sheet.getKey)).asList.toList
  }

  def fetchOne(sheet: Sheet, relationName: String, relationType: String): Option[SheetMember] = {
    try {
      val mm: SheetMemberMeta = SheetMemberMeta.get
      Datastore.query(mm)
        .filter(mm.relationName.equal(relationName))
        .filter(mm.relationType.equal(relationType))
        .filter(mm.sheetRef.equal(sheet.getKey)).asSingle match {
          case null => None
          case member: SheetMember => Some(member)
          case _ => None
        }
    } catch {
      case e: Exception => None
    }
  }
}