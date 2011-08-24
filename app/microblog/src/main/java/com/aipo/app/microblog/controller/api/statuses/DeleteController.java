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

import com.aipo.app.microblog.controller.JSONController;
import com.aipo.app.microblog.service.MessageService;
import com.google.appengine.repackaged.com.google.common.collect.Maps;

public class DeleteController extends JSONController {

  /**
   * @return
   * @throws Exception
   */
  @Override
  protected Map<String, Object> execute() throws Exception {
    MessageService messageService = MessageService.get();
    Map<String, Object> result = Maps.newHashMap();

    Long id = null;
    Long parentId = null;

    try {
      id = LongUtil.toLong(request.getParameter("id"));
    } catch (Throwable ignore) {
      result.put(STATUS, 400);
      result.put(ERROR_CODE, "VALIDATIONERROR");
      result.put(ERROR_MESSAGE, "不正なパラメータです。");
      result.put(CAN_RETRY, false);
    }

    try {
      parentId = LongUtil.toLong(request.getParameter("parentId"));
    } catch (NumberFormatException e) {
      result.put(STATUS, 400);
      result.put(ERROR_CODE, "VALIDATIONERROR");
      result.put(ERROR_MESSAGE, "不正なパラメータです。");
      result.put(CAN_RETRY, false);
    }

    messageService.delete(getViewerId(), id, parentId);

    return result;
  }
}
