package com.aipo.app.microblog.model;

import static org.hamcrest.CoreMatchers.*;
import static org.junit.Assert.*;

import org.junit.Test;
import org.slim3.tester.AppEngineTestCase;

public class MessageTest extends AppEngineTestCase {

  private final Message model = new Message();

  @Test
  public void test() throws Exception {
    assertThat(model, is(notNullValue()));
  }
}
