package getexcelfunctions.controller.searchparam;

import getexcelfunctions.meta.ExcelFunctionsMeta;
import getexcelfunctions.model.ExcelFunctions;
import getexcelfunctions.service.GefService;

import java.io.PrintWriter;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

public class IndexController extends Controller {

    private GefService service = new GefService();

    @Override
    public Navigation run() throws Exception {
        ExcelFunctions data = new ExcelFunctions();
        PrintWriter out = response.getWriter();
        String categories_param = "";
        String function_param = "";
        String comments_param = "";
        String form_param = "";

        if (request.getParameter("categories") != null)
            categories_param = request.getParameter("categories");
        if (request.getParameter("function") != null)
            function_param = request.getParameter("function");
        if (request.getParameter("comments") != null)
            comments_param = request.getParameter("comments");
        if (request.getParameter("form") != null)
            form_param = request.getParameter("form");

        // json out format
        // out.println("{");
        // out.println("\"excelfunction\": [");
        // out.println("{");
        // out.println("\"categories\": \"" + categories_param + "\",");
        // out.println("\"function\": \"" + function_param + "\",");
        // out.println("\"comments\": \"" + comments_param + "\",");
        // out.println("\"form\": \"" + form_param + "\"");
        // out.println("}");
        // out.println("]");
        // out.println("}");

        if (service.searchParam(
            categories_param,
            comments_param,
            form_param,
            function_param) != null)
            data =
                service.searchParam(
                    categories_param,
                    comments_param,
                    form_param,
                    function_param);
        else {
            out.println("error");
            // json out format
            data.setCategories(categories_param);
            data.setComments(comments_param);
            data.setForm(form_param);
            data.setFunction(function_param);
        }

        String json = ExcelFunctionsMeta.get().modelToJson(data);
        out.println("{");
        out.println("\"excelfunction\": [");
        out.println(json);
        out.println("]");
        out.println("}");

        return null;
    }
}
