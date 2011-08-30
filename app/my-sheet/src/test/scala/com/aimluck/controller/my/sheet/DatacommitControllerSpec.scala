package com.aimluck.controller.my.sheet

import org.specs.Specification
import org.specs.runner._
import org.slim3.tester.ControllerTester
import org.dotme.liquidtpl.Constants

object DatacommitControllerSpec extends org.specs.Specification {

  val tester = new ControllerTester( classOf[DatacommitController] )
  Constants._pathPrefix = "war/"
  "DatacommitController" should {
    doBefore{ tester.setUp;tester.start("/my/sheet/datacommit")}

    "not null" >> {
      val controller = tester.getController[DatacommitController]
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
class DatacommitControllerSpecTest extends JUnit4( DatacommitControllerSpec )
