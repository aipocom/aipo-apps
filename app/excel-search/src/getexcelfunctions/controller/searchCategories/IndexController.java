package getexcelfunctions.controller.searchCategories;

import getexcelfunctions.meta.ExcelFunctionsMeta;
import getexcelfunctions.model.ExcelFunctions;

import java.io.PrintWriter;
import java.util.List;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.datastore.Datastore;

import com.google.appengine.api.datastore.Key;

public class IndexController extends Controller {

    @Override
    public Navigation run() throws Exception {
        PrintWriter out = response.getWriter();
        String json;
        String categories_param = "";
        System.setProperty("file.encoding", "UTF-8");
        if (request.getParameter("categories") != null)
            categories_param = request.getParameter("categories");
        else
            return null;

        ExcelFunctionsMeta e = ExcelFunctionsMeta.get();
        List<ExcelFunctions> datalist = Datastore.query(e)
            .filter(e.categories.equal(categories_param))
            .asList();



        out.println("{");
        out.println("\"excelfunction\": [");
        int i;
        for (i = 0; i < datalist.size()-1; i++) {
            json = ExcelFunctionsMeta.get().modelToJson(datalist.get(i));
            out.println(json+",");
        }
        json = ExcelFunctionsMeta.get().modelToJson(datalist.get(i));
        out.println(json);
        out.println("]");
        out.println("}");

        return null;
    }
}
