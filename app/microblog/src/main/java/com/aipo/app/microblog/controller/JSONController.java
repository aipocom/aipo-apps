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
package com.aipo.app.microblog.controller;

import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.json.simple.JSONObject;
import org.slim3.controller.Navigation;
import org.slim3.controller.SimpleController;
import org.slim3.datastore.EntityNotFoundRuntimeException;

import com.google.appengine.api.datastore.DatastoreFailureException;
import com.google.appengine.api.datastore.DatastoreTimeoutException;
import com.google.appengine.repackaged.com.google.common.collect.Maps;
import com.google.apphosting.api.ApiProxy.CapabilityDisabledException;
import com.google.apphosting.api.DeadlineExceededException;

public abstract class JSONController extends SimpleController {

  private static final Logger logger = Logger.getLogger(JSONController.class
    .getName());

  public static final String STATUS = "status";

  public static final String ERROR_CODE = "errorCode";

  public static final String ERROR_MESSAGE = "errorMessage";

  public static final String CAN_RETRY = "canRetry";

  public static final String DATA = "data";

  protected abstract Map<String, Object> execute() throws Exception;

  @Override
  protected Navigation run() throws Exception {
    response.setContentType("application/json;");
    response.setCharacterEncoding("utf-8");

    Map<String, Object> handle = execute();
    if (handle.get(STATUS) == null) {
      handle.put(STATUS, 200);
    }

    JSONObject.writeJSONString(handle, response.getWriter());
    response.flushBuffer();
    return null;
  }

  @Override
  protected Navigation handleError(Throwable error) throws Throwable {
    logger.log(Level.WARNING, error.getMessage(), error);
    Map<String, Object> map = Maps.newHashMap();
    String errorCode;
    String errorMessage;
    int status = 500;
    boolean canRetry = false;
    if (error instanceof CapabilityDisabledException) {
      errorCode = "READONLY";
      errorMessage = "サーバーメンテナンス中です。";
    } else if (error instanceof DatastoreTimeoutException) {
      errorCode = "DSTIMEOUT";
      errorMessage = "処理がタイムアウトしました。";
      canRetry = true;
    } else if (error instanceof DatastoreFailureException) {
      errorCode = "DSFAILURE";
      errorMessage = "サーバーエラーが発生しました。";
    } else if (error instanceof DeadlineExceededException) {
      errorCode = "DEE";
      errorMessage = "処理がタイムアウトしました。";
      canRetry = true;
    } else if (error instanceof EntityNotFoundRuntimeException) {
      status = 400;
      errorCode = "NOTFOUND";
      errorMessage = "データが見つかりませんでした。";
      canRetry = true;
    } else {
      errorCode = "UNKNOWN";
      errorMessage = "サーバーエラーが発生しました。";
    }
    map.put(STATUS, status);
    map.put(ERROR_CODE, errorCode);
    map.put(ERROR_MESSAGE, errorMessage);
    map.put(CAN_RETRY, canRetry);
    JSONObject.writeJSONString(map, response.getWriter());
    response.flushBuffer();
    return null;
  }

  protected String getViewerId() {
    return request.getParameter("opensocial_owner_id");
  }

}
