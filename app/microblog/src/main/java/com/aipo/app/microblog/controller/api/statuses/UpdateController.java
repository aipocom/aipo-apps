package com.aipo.app.microblog.controller.api.statuses;

import java.util.Map;

import org.slim3.util.LongUtil;
import org.slim3.util.StringUtil;

import com.aipo.app.microblog.controller.JSONController;
import com.aipo.app.microblog.service.MessageService;
import com.google.appengine.repackaged.com.google.common.collect.Maps;

public class UpdateController extends JSONController {

  /**
   * @return
   * @throws Exception
   */
  @Override
  protected Map<String, Object> execute() throws Exception {
    MessageService messageService = MessageService.get();
    Map<String, Object> result = Maps.newHashMap();

    String body = request.getParameter("body");
    Long parentId = null;
    if (StringUtil.isEmpty(body)) {
      result.put(STATUS, 400);
      result.put(ERROR_CODE, "VALIDATIONERROR");
      result.put(ERROR_MESSAGE, "コメントを入力してください。");
      result.put(CAN_RETRY, false);
      return result;
    }
    if (body.length() > 500) {
      result.put(STATUS, 400);
      result.put(ERROR_CODE, "VALIDATIONERROR");
      result.put(ERROR_MESSAGE, "コメントは500文字以内で入力してください。");
      result.put(CAN_RETRY, false);
      return result;
    }

    try {
      parentId = LongUtil.toLong(request.getParameter("parentId"));
    } catch (NumberFormatException e) {
      result.put(STATUS, 400);
      result.put(ERROR_CODE, "VALIDATIONERROR");
      result.put(ERROR_MESSAGE, "不正なパラメータです。");
      result.put(CAN_RETRY, false);
      return result;
    }

    Long id = messageService.update(getViewerId(), body, parentId);
    Map<String, Object> data = Maps.newHashMap();
    data.put("id", id);
    result.put("data", data);

    return result;
  }
}
