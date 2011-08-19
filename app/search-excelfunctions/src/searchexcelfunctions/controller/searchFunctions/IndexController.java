package searchexcelfunctions.controller.searchFunctions;

import java.io.PrintWriter;
import java.util.List;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.datastore.Datastore;

import searchexcelfunctions.meta.ExcelFunctionsMeta;
import searchexcelfunctions.model.ExcelFunctions;

public class IndexController extends Controller {

    @Override
    public Navigation run() throws Exception {
        String json;
        String function_param = "";

        if (request.getParameter("functions") != null)
            function_param = request.getParameter("functions");
        else
            return null;

        ExcelFunctionsMeta e = ExcelFunctionsMeta.get();
        List<ExcelFunctions> datalist =
            Datastore
                .query(e)
                .filter(e.function.startsWith(function_param.toUpperCase()))
                .asList();

        // Output
        response.setContentType("text/plain;charset=UTF-8");
        PrintWriter out = response.getWriter();
        StringBuffer sb = new StringBuffer();

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
