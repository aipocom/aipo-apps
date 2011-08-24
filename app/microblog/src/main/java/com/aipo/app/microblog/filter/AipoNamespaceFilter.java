/*
 * Aipo is a groupware program developed by Aimluck,Inc.
 * Copyright (C) 2004-2011 Aimluck,Inc.
 * http://www.aipo.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
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
