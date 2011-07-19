package getexcelfunctions.controller.getparam;

import getexcelfunctions.service.GefService;

import java.io.PrintWriter;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

public class IndexController extends Controller {

    private GefService service = new GefService();

    @Override
    public Navigation run() throws Exception {
        PrintWriter out = response.getWriter();
        out.println("try to write like next form");
        out.println("");
        out.println("http://getexcelfunctions.appspot.com/getparam/?categories=a&form=c&comments=d&function=k");//http://localhost:8888/getparam/?categories=a&form=c&comments=d&function=k
        out.println("");
        if (request.getParameter("categories") != null
            && request.getParameter("function") != null
            && request.getParameter("comments") != null
            && request.getParameter("form") != null) {
            String categories_param = request.getParameter("categories");
            String function_param = request.getParameter("function");
            String comments_param = request.getParameter("comments");
            String form_param = request.getParameter("form");


            out.println("categories=" + categories_param);
            out.println("function=" + function_param);
            out.println("comments=" + comments_param);
            out.println("form=" + form_param);

            service.registerParam(categories_param, comments_param, form_param, function_param);
        }
        return null;
    }
}
