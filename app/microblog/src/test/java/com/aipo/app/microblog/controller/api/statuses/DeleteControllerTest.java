package com.aipo.app.microblog.controller.api.statuses;

import static org.hamcrest.CoreMatchers.*;
import static org.junit.Assert.*;
import static org.junit.matchers.JUnitMatchers.*;

import org.junit.Test;
import org.slim3.datastore.Datastore;
import org.slim3.tester.ControllerTestCase;

import com.aipo.app.microblog.model.Message;
import com.aipo.app.microblog.service.MessageService;

public class DeleteControllerTest extends ControllerTestCase {

  private final MessageService service = new MessageService();

  private Long tmpId1 = null;

  private Long tmpId2 = null;

  private Long tmpId3 = null;

  private Long tmpId4 = null;

  @Override
  public void setUp() throws Exception {
    super.setUp();

    tmpId1 = service.update("org001:sample1", "This is body1.");
    tmpId2 = service.update("org001:sample1", "This is body2.");
    tmpId3 = service.update("org001:sample2", "This is body3.");
    tmpId4 = service.update("org001:sample1", "This is comment1.", tmpId2);

  }

  @Test
  public void run() throws Exception {

    tester.request.addParameter("opensocial_owner_id", "org001:sample1");

    tester.request.addParameter("id", String.valueOf(tmpId1));
    tester.start("/api/statuses/delete");
    DeleteController controller = tester.getController();
    assertThat(controller, is(notNullValue()));
    assertThat(tester.isRedirect(), is(false));
    assertThat(tester.getDestinationPath(), is(nullValue()));

    String output = tester.response.getOutputAsString();

    assertThat(output, containsString("\"status\":200"));
    assertThat(Datastore.query(Message.class).count(), is(3));

    System.out.println(output);

  }

  /**
   * コメント付のメッセージを削除する場合
   * 
   * @throws Exception
   */
  @Test
  public void withComment() throws Exception {

    tester.request.addParameter("opensocial_owner_id", "org001:sample1");

    tester.request.addParameter("id", String.valueOf(tmpId2));
    tester.start("/api/statuses/delete");
    DeleteController controller = tester.getController();
    assertThat(controller, is(notNullValue()));
    assertThat(tester.isRedirect(), is(false));
    assertThat(tester.getDestinationPath(), is(nullValue()));

    String output = tester.response.getOutputAsString();

    assertThat(output, containsString("\"status\":200"));
    assertThat(Datastore.query(Message.class).count(), is(2));

    System.out.println(output);

  }

  /**
   * 他のユーザーのメッセージを削除しようとした場合
   * 
   * @throws Exception
   */
  @Test
  public void otherViewer() throws Exception {

    tester.request.addParameter("opensocial_owner_id", "org001:sample1");

    tester.request.addParameter("id", String.valueOf(tmpId3));
    tester.start("/api/statuses/delete");
    DeleteController controller = tester.getController();
    assertThat(controller, is(notNullValue()));
    assertThat(tester.isRedirect(), is(false));
    assertThat(tester.getDestinationPath(), is(nullValue()));

    String output = tester.response.getOutputAsString();

    assertThat(output, containsString("NOTFOUND"));
    assertThat(output, containsString("\"status\":400"));

    System.out.println(output);

  }

  /**
   * 指定された id のメッセージが見つからない場合
   * 
   * @throws Exception
   */
  @Test
  public void notfound() throws Exception {

    tester.request.addParameter("opensocial_owner_id", "org001:sample1");

    tester.request.addParameter("id", "9999");
    tester.start("/api/statuses/delete");
    DeleteController controller = tester.getController();
    assertThat(controller, is(notNullValue()));
    assertThat(tester.isRedirect(), is(false));
    assertThat(tester.getDestinationPath(), is(nullValue()));

    String output = tester.response.getOutputAsString();

    assertThat(output, containsString("NOTFOUND"));
    assertThat(output, containsString("\"status\":400"));

    System.out.println(output);
  }

  /**
   * コメントの削除
   * 
   * @throws Exception
   */
  @Test
  public void deleteComment() throws Exception {

    tester.request.addParameter("opensocial_owner_id", "org001:sample1");

    tester.request.addParameter("id", String.valueOf(tmpId4));
    tester.request.addParameter("parentId", String.valueOf(tmpId2));
    tester.start("/api/statuses/delete");
    DeleteController controller = tester.getController();
    assertThat(controller, is(notNullValue()));
    assertThat(tester.isRedirect(), is(false));
    assertThat(tester.getDestinationPath(), is(nullValue()));

    String output = tester.response.getOutputAsString();

    assertThat(output, containsString("\"status\":200"));
    assertThat(Datastore.query(Message.class).count(), is(3));

    System.out.println(output);
  }
}
