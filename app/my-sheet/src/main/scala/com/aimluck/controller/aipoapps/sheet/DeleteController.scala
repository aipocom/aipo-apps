package com.aimluck.controller.aipoapps.sheet

import org.dotme.liquidtpl.controller.AbstractJsonController
import org.dotme.liquidtpl.controller.AbstractJsonDataController
import sjson.json.JsonSerialization._
import com.aimluck.service.SheetService

class DeleteController extends com.aimluck.controller.my.sheet.DeleteController {
  override def getRelation: (String, String) = {
    SheetService.getAipoappsRelation(request)
  }
}
