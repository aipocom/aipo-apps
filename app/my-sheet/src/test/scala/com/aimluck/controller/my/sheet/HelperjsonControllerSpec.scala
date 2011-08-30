package com.aimluck.controller.my.sheet

import org.specs.Specification
import org.specs.runner._
import org.slim3.tester.ControllerTester
import org.dotme.liquidtpl.Constants

object HelperjsonControllerSpec extends org.specs.Specification {

  val tester = new ControllerTester(classOf[HelperjsonController])

  "HelperjsonController" should {
    Constants._pathPrefix = "war/"
    doBefore { tester.setUp; tester.start("/my/sheet/helperjson") }

    "not null" >> {
      val controller = tester.getController[HelperjsonController]
      controller mustNotBe null
    }
    "not redirect" >> {
      tester.isRedirect mustBe false
    }
    "get destination path is null" >> {
      tester.getDestinationPath mustBe null
    }

    doAfter { tester.tearDown }

    "after tearDown" >> {
      true
    }
  }
}
class HelperjsonControllerSpecTest extends JUnit4(HelperjsonControllerSpec)
