package com.aimluck.controller.aipoapps.sheet

import com.aimluck.service.SheetService

class ColumnjsonController extends com.aimluck.controller.my.sheet.ColumnjsonController {
  override def getRelation: (String, String) = {
    SheetService.getAipoappsRelation(request)
  }
}
