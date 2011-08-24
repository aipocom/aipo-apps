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

package com.aipo.app.microblog.util;

import java.util.ConcurrentModificationException;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.slim3.datastore.Datastore;
import org.slim3.memcache.Memcache;
import org.slim3.util.LongUtil;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.memcache.MemcacheServiceException;

/**
 *
 */
public final class Counter {

  public static final String COUNTER_PREFIX = "com.aipo.counter#";

  public static final String KIND_PREFIX = "_a.C.";

  public static final String COUNT_VALUE_PROPERTY = "c";

  private static final Logger logger = Logger
    .getLogger(Counter.class.getName());

  private Counter() {
  }

  /**
   * 
   * @param key
   * @return
   * @throws NullPointerException
   */
  public static Long increment(String key) throws NullPointerException {
    if (key == null) {
      throw new NullPointerException("The key parameter must not be null.");
    }

    Long countValue = null;

    try {
      countValue = Memcache.increment(COUNTER_PREFIX + key, 1);
    } catch (Throwable t) {
      logger.log(Level.WARNING, "Failed to increment on Memcache: ", t);
    }

    if (countValue == null) {
      countValue = restoreCountValue(key);
    }

    Entity entity = new Entity(Counter.KIND_PREFIX + key);
    entity.setProperty(Counter.COUNT_VALUE_PROPERTY, countValue);
    Datastore.putWithoutTx(entity);

    return countValue;
  }

  /**
   * 
   * @param key
   * @throws NullPointerException
   */
  public static void deleteCountValueOnMemcache(String key)
      throws NullPointerException {
    if (key == null) {
      throw new NullPointerException("The key parameter must not be null.");
    }

    String memcacheKey = COUNTER_PREFIX + key;
    try {
      Memcache.delete(memcacheKey);
    } catch (MemcacheServiceException e) {
      logger.log(Level.WARNING, "Failed to delete on Memcache: ", e);
    }
  }

  /**
   * 
   * @param key
   * @param limit
   */
  public static void cleanup(String key, int limit) {
    List<Key> list =
      Datastore.query(Counter.KIND_PREFIX + key).sort(
        Counter.COUNT_VALUE_PROPERTY,
        SortDirection.DESCENDING).limit(limit + 1).asKeyList();

    if (list.size() < 2) {
      logger.info("Cleanup: key(" + key + "),count(0)");
    } else {
      list.remove(0);
      try {
        Datastore.deleteWithoutTx(list);
        logger.info("Cleanup: key(" + key + "),count(" + (list.size()) + ")");
      } catch (ConcurrentModificationException e) {
        // ignore
        logger.log(Level.WARNING, "Cleanup faild.", e);
      }
    }
  }

  /**
   * 
   * @param key
   * @return
   * @throws NullPointerException
   */
  public static Long currentValue(String key) throws NullPointerException {
    if (key == null) {
      throw new NullPointerException("The key parameter must not be null.");
    }
    List<Entity> list =
      Datastore.query(KIND_PREFIX + key).sort(
        COUNT_VALUE_PROPERTY,
        SortDirection.DESCENDING).limit(1).asList();

    Long countValue = null;
    if (list.isEmpty()) {
      countValue = 0L;
    } else {
      Long value =
        LongUtil.toLong(list.get(0).getProperty(COUNT_VALUE_PROPERTY));
      countValue = value;
    }

    return countValue;
  }

  /**
   * 
   * @param key
   * @return
   * @throws NullPointerException
   */
  private static long restoreCountValue(String key) throws NullPointerException {
    if (key == null) {
      throw new NullPointerException("The key parameter must not be null.");
    }

    List<Entity> list =
      Datastore.query(KIND_PREFIX + key).sort(
        COUNT_VALUE_PROPERTY,
        SortDirection.DESCENDING).limit(1).asList();

    Long countValue = null;
    if (list.isEmpty()) {
      countValue = 1L;
    } else {
      Long value =
        LongUtil.toLong(list.get(0).getProperty(COUNT_VALUE_PROPERTY));
      countValue = value + 1L;
    }

    String memKey = COUNTER_PREFIX + key;

    try {
      Memcache.put(memKey, countValue);
    } catch (MemcacheServiceException e) {
      logger.log(Level.WARNING, "Failed to put on Memcache: ", e);
    }

    logger.log(
      countValue > 1 ? Level.WARNING : Level.INFO,
      "Restored count value: " + memKey + " " + countValue);

    return countValue;
  }
}