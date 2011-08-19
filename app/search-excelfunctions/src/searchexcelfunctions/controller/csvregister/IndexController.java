package searchexcelfunctions.controller.csvregister;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.URL;
import java.net.URLConnection;
import java.util.StringTokenizer;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;

import searchexcelfunctions.service.GefService;

public class IndexController extends Controller {

    private GefService service = new GefService();

    @Override
    public Navigation run() throws Exception {
        try {
            PrintWriter out = response.getWriter();
            URL url =
                new URL(
                    "http://searchexcelfunctions.appspot.com/excelfunctionsfile.csv");
            URLConnection conn = url.openConnection();
            InputStream in = conn.getInputStream();
            BufferedReader br =
                new BufferedReader(new InputStreamReader(in, "Shift_JIS"));
            System.setProperty("file.encoding", "UTF-8");
            out.println(System.getProperty("file.encoding"));

            String categories;
            String function;
            String comments;
            String form;

            String line = "";
            while ((line = br.readLine()) != null) {
                StringTokenizer st = new StringTokenizer(line, ";");

                categories = st.nextToken();
                function = st.nextToken();
                comments =
                    new String(st.nextToken().getBytes("UTF-8"), "UTF-8");
                form = new String(st.nextToken().getBytes("UTF-8"), "UTF-8");

                service.registerParam(categories, comments, form, function);
            }
            br.close();

        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return null;
    }
}
