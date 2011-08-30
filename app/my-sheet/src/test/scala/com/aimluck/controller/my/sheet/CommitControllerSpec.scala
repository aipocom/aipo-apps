package com.aimluck.controller.my.sheet

import org.specs.Specification
import org.specs.runner._
import org.slim3.tester.ControllerTester
import org.dotme.liquidtpl.Constants

object CommitControllerSpec extends org.specs.Specification {

  val tester = new ControllerTester( classOf[CommitController] )
  Constants._pathPrefix = "war/"
  "CommitController" should {
    doBefore{ tester.setUp;tester.start("/my/sheet/commit")}

    "not null" >> {
      val controller = tester.getController[CommitController]
      controller mustNotBe null
    }
    "not redirect" >> {
      tester.isRedirect mustBe false
    }
    "get destination path is null" >> {
      tester.getDestinationPath mustBe null
    }

    doAfter{ tester.tearDown}

    "after tearDown" >> {
        true
    }
  }
}
class CommitControllerSpecTest extends JUnit4( CommitControllerSpec )
