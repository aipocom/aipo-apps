package com.aimluck.controller.aipoapps.sheet

import java.util.logging.Logger
import org.dotme.liquidtpl.controller.AbstractJsonDataController
import org.dotme.liquidtpl.Constants
import org.dotme.liquidtpl.LanguageUtil
import com.aimluck.meta.SheetMeta
import com.aimluck.service.SheetService
import com.aimluck.service.UserDataService
import dispatch.json._
import sjson.json.JsonSerialization._
import sjson.json.DefaultProtocol._
import com.aimluck.service.SheetMemberService
import org.dotme.liquidtpl.helper.BasicHelper
import org.slim3.controller.Navigation
import org.hidetake.opensocial.filter.model.OpenSocialRequest

class JsonController extends com.aimluck.controller.my.sheet.JsonController {
  override def getRelation: (String, String) = {
    SheetService.getAipoappsRelation(request)
  }
}


