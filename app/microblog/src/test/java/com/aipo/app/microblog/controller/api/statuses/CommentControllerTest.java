package com.aipo.app.microblog.controller.api.statuses;

import static org.hamcrest.CoreMatchers.*;
import static org.junit.Assert.*;
import static org.junit.matchers.JUnitMatchers.*;

import org.junit.Test;
import org.slim3.tester.ControllerTestCase;

import com.aipo.app.microblog.service.MessageService;

public class CommentControllerTest extends ControllerTestCase {

  private final MessageService service = new MessageService();

  @Test
  public void run() throws Exception {

    tester.request.addParameter("opensocial_owner_id", "org001:sample1");

    service.update("org001:sample1", "This is body1.");
    service.update("org001:sample1", "This is body2.");
    service.update("org001:sample1", "This is body3.");
    service.update("org001:sample1", "This is body4.");
    service.update("org001:sample1", "This is body5.");
    service.update("org001:sample1", "This is body6.");
    service.update("org001:sample1", "This is body7.");
    service.update("org001:sample1", "This is body8.");
    service.update("org001:sample1", "This is body9.");
    service.update("org001:sample1", "This is body10.");
    service.update("org001:sample1", "This is body11.");
    service.update("org001:sample1", "This is body12.");
    service.update("org001:sample1", "This is body13.");
    service.update("org001:sample1", "This is body14.");
    service.update("org001:sample1", "This is body15.");
    service.update("org001:sample1", "This is body16.");
    service.update("org001:sample1", "This is body17.");
    service.update("org001:sample1", "This is body18.");
    service.update("org001:sample1", "This is body19.");
    service.update("org001:sample1", "This is body20.");
    service.update("org001:sample1", "This is body21.");
    Long id1 = service.update("org001:sample1", "This is body22.");
    service.update("org001:sample2", "This is comment1.", id1);
    service.update("org001:sample1", "This is comment2.", id1);
    service.update("org001:sample2", "This is comment3.", id1);
    service.update("org001:sample1", "This is comment4.", id1);
    service.update("org001:sample2", "This is comment5.", id1);
    service.update("org001:sample1", "This is comment6.", id1);
    service.update("org001:sample2", "This is comment7.", id1);
    service.update("org001:sample1", "This is comment8.", id1);
    service.update("org001:sample2", "This is body23.");

    tester.request.addParameter("parentId", String.valueOf(id1));
    tester.start("/api/statuses/comment");
    CommentController controller = tester.getController();
    assertThat(controller, is(notNullValue()));
    assertThat(tester.isRedirect(), is(false));
    assertThat(tester.getDestinationPath(), is(nullValue()));

    String output = tester.response.getOutputAsString();

    assertThat(output, containsString("\"status\":200"));

    assertThat(output, not(containsString("This is body1.")));
    assertThat(output, not(containsString("This is body2.")));
    assertThat(output, not(containsString("This is body3.")));
    assertThat(output, not(containsString("This is body4.")));
    assertThat(output, not(containsString("This is body5.")));
    assertThat(output, not(containsString("This is body6.")));
    assertThat(output, not(containsString("This is body7.")));
    assertThat(output, not(containsString("This is body8.")));
    assertThat(output, not(containsString("This is body9.")));
    assertThat(output, not(containsString("This is body10.")));
    assertThat(output, not(containsString("This is body11.")));
    assertThat(output, not(containsString("This is body12.")));
    assertThat(output, not(containsString("This is body13.")));
    assertThat(output, not(containsString("This is body14.")));
    assertThat(output, not(containsString("This is body15.")));
    assertThat(output, not(containsString("This is body16.")));
    assertThat(output, not(containsString("This is body17.")));
    assertThat(output, not(containsString("This is body18.")));
    assertThat(output, not(containsString("This is body19.")));
    assertThat(output, not(containsString("This is body20.")));
    assertThat(output, not(containsString("This is body21.")));
    assertThat(output, not(containsString("This is body22.")));
    assertThat(output, not(containsString("This is body23.")));
    assertThat(output, containsString("This is comment1."));
    assertThat(output, containsString("This is comment2."));
    assertThat(output, containsString("This is comment3."));
    assertThat(output, containsString("This is comment4."));
    assertThat(output, containsString("This is comment5."));
    assertThat(output, containsString("This is comment6."));
    assertThat(output, containsString("This is comment7."));
    assertThat(output, containsString("This is comment8."));

  }
}
