package searchexcelfunctions.controller.searchCategories;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.datastore.Datastore;

import searchexcelfunctions.meta.ExcelFunctionsMeta;
import searchexcelfunctions.model.ExcelFunctions;
import searchexcelfunctions.service.GefService;

public class IndexController extends Controller {

    private GefService service = new GefService();

    @Override
    public Navigation run() throws Exception {
        String json;
        String categories_param = ""; //categories
        String req_param = "";        //function & comments
        String search_all = "0";
        List<ExcelFunctions> datalist = new ArrayList<ExcelFunctions>();
        //preference output
        response.setContentType("text/plain;charset=UTF-8");
        PrintWriter out = response.getWriter();
        StringBuffer sb = new StringBuffer();


        if (request.getParameter("categories") != null)
            categories_param = request.getParameter("categories");
        else
            return null;

        if (request.getParameter("req") != null)
            req_param = request.getParameter("req");
        else
            return null;


        if (categories_param.equals(search_all)) {
            ExcelFunctionsMeta e = ExcelFunctionsMeta.get();
            datalist = Datastore.query(e)
                    .filter(e.function.startsWith(req_param.toUpperCase()))
                    .sort(e.function.asc).asList();
        } else {
            ExcelFunctionsMeta e = ExcelFunctionsMeta.get();
            datalist =
                Datastore
                    .query(e)
                    .filter(e.categories.equal(categories_param))
                    .filter(e.function.startsWith(req_param.toUpperCase()))
                    .asList();
        }

        // Output
        if (datalist.size() == 0) {
            sb.append("{");
            sb.append("\"excelfunction\": [");
            sb.append("]");
            sb.append("}");
        } else {
            sb.append("{");
            sb.append("\"excelfunction\": [");
            int i;
            for (i = 0; i < datalist.size() - 1; i++) {
                json = ExcelFunctionsMeta.get().modelToJson(datalist.get(i));
                sb.append(json + ",");
            }
            json = ExcelFunctionsMeta.get().modelToJson(datalist.get(i));
            sb.append(json);
            sb.append("]");
            sb.append("}");
        }

        out.println(new String(sb));

        out.close();

        return null;
    }
}
