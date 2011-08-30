package com.aimluck.controller.my.sheet

import org.specs.Specification
import org.specs.runner._
import org.slim3.tester.ControllerTester
import org.dotme.liquidtpl.Constants
object DataControllerSpec extends org.specs.Specification {

  val tester = new ControllerTester( classOf[DataController] )
  Constants._pathPrefix = "war/"
  "DataController" should {
    doBefore{ tester.setUp;tester.start("/my/sheet/data")}

    "not null" >> {
      val controller = tester.getController[DataController]
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
class DataControllerSpecTest extends JUnit4( DataControllerSpec )
