/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package com.aimluck.lib.util

import java.util.regex.Pattern

object TextUtil {
  def validateEmail(text:String):Boolean = {
    val ptnStr ="[^@]+@[^@]+";
    val ptn = Pattern.compile(ptnStr);
    val mc = ptn.matcher(text);
    mc.matches
  }
}