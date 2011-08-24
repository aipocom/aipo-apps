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
