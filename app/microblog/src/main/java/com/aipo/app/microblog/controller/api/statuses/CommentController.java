package com.aipo.app.microblog.controller.api.statuses;

import java.util.Map;

import org.slim3.util.LongUtil;

import com.aipo.app.microblog.controller.JSONController;
import com.aipo.app.microblog.service.MessageService;
import com.google.appengine.repackaged.com.google.common.collect.Maps;

public class CommentController extends JSONController {

  /**
   * @return
   * @throws Exception
   */
  @Override
  protected Map<String, Object> execute() throws Exception {
    MessageService messageService = MessageService.get();
    Map<String, Object> result = Maps.newHashMap();
    Long parentId = null;
    try {
      parentId = LongUtil.toLong(request.getParameter("parentId"));
    } catch (NumberFormatException e) {
      result.put(STATUS, 400);
      result.put(ERROR_CODE, "VALIDATIONERROR");
      result.put(ERROR_MESSAGE, "不正なパラメータです。");
      result.put(CAN_RETRY, false);
      return result;
    }

    /*-
    String cursor = request.getParameter("start");
    if (StringUtil.isEmpty(cursor)) {
      cursor = null;
    }
     */

    result.put("data", messageService.fetchAllCommentData(parentId));

    return result;
  }
}
