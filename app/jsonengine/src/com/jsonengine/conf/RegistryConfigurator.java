package com.jsonengine.conf;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.Properties;

import org.hidetake.opensocial.filter.config.ConfigurationException;
import org.hidetake.opensocial.filter.extension.ValidationLogger;
import org.hidetake.opensocial.filter.model.AppRegistry;
import org.hidetake.opensocial.filter.model.ExtensionRegistry;
import org.hidetake.opensocial.filter.model.OpenSocialApp;

public class RegistryConfigurator implements
        org.hidetake.opensocial.filter.config.RegistryConfigurator {

    public void configure(AppRegistry registry) throws ConfigurationException {
        try {
            Properties prop = new Properties();
            prop.load(RegistryConfigurator.class
                .getResourceAsStream("/settings.properties"));

            URL resource =
                RegistryConfigurator.class.getResource("/public.cer");
            StringBuffer cert = new StringBuffer();
            InputStream is = resource.openStream();
            BufferedReader br = new BufferedReader(new InputStreamReader(is));
            while (br.ready()) {
                cert.append(br.readLine()).append("\n");
            }
            br.close();
            is.close();

            registry.register(new OpenSocialApp(prop.getProperty("appId"), prop
                .getProperty("gadgetXmlUrl"), OpenSocialApp
                .createOAuthAccessorRSASHA1(
                    prop.getProperty("consumerKey"),
                    cert.toString())));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void configure(ExtensionRegistry registry)
            throws ConfigurationException {
        registry.register(new ValidationLogger());
    }

}
