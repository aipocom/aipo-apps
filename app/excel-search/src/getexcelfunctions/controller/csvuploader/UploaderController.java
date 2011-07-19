package getexcelfunctions.controller.csvuploader;

import getexcelfunctions.service.GefService;

import java.io.PrintWriter;

import org.slim3.controller.Controller;
import org.slim3.controller.Navigation;
import org.slim3.controller.upload.FileItem;

public class UploaderController extends Controller {

    private GefService service = new GefService();

    @Override
    public Navigation run() throws Exception {
        FileItem csvfile = requestScope("csvfile");
        service.upload(csvfile);
        return redirect("/gef/");
    }
}
