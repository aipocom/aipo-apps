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
package com.aipo.app.microblog.filter;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import com.google.appengine.api.NamespaceManager;

/**
 *
 */
public class AipoNamespaceFilter implements Filter {

  private static final Logger logger = Logger
    .getLogger(AipoNamespaceFilter.class.getName());

  /**
   * @param filterConfig
   * @throws ServletException
   */
  @Override
  public void init(FilterConfig filterConfig) throws ServletException {
  }

  /**
   * @param request
   * @param response
   * @param chain
   * @throws IOException
   * @throws ServletException
   */
  @Override
  public void doFilter(ServletRequest request, ServletResponse response,
      FilterChain chain) throws IOException, ServletException {
    try {
      setNamespace((HttpServletRequest) request);
      chain.doFilter(request, response);
    } finally {
      //
    }
  }

  /**
   *
   */
  @Override
  public void destroy() {
  }

  private void setNamespace(HttpServletRequest request) {
    String appId = request.getParameter("opensocial_app_id");
    String viewerId = request.getParameter("opensocial_owner_id");
    String[] split = viewerId.split(":");
    String orgId = split[0];

    String namespace = appId + "." + orgId;
    // Namespace: <APP_ID>.org0000050
    NamespaceManager.set(namespace);

    logger.log(Level.INFO, "Namespace: " + namespace);

  }
}
