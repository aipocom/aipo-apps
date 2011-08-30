package com.aimluck.controller.my.sheet

import org.specs.Specification
import org.specs.runner._
import org.slim3.tester.ControllerTester
import org.dotme.liquidtpl.Constants

object JsonControllerSpec extends org.specs.Specification {

  val tester = new ControllerTester(classOf[JsonController])
  Constants._pathPrefix = "war/"
  "JsonController" should {
    doBefore { tester.setUp; tester.start("/my/sheet/json") }

    "not null" >> {
      val controller = tester.getController[JsonController]
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
class JsonControllerSpecTest extends JUnit4(JsonControllerSpec)
