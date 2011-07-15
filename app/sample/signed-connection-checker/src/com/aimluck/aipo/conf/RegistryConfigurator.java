package com.aimluck.aipo.conf;

import org.hidetake.opensocial.filter.config.ConfigurationException;
import org.hidetake.opensocial.filter.extension.ValidationLogger;
import org.hidetake.opensocial.filter.model.AppRegistry;
import org.hidetake.opensocial.filter.model.ExtensionRegistry;
import org.hidetake.opensocial.filter.model.OpenSocialApp;

public class RegistryConfigurator implements
        org.hidetake.opensocial.filter.config.RegistryConfigurator {

    private static final String cert = "-----BEGIN CERTIFICATE-----\n"
        + "MIIC+TCCAeGgAwIBAgIJAPgmgzknJyVzMA0GCSqGSIb3DQEBBQUAMBMxETAPBgNV\n"
        + "BAMMCGFpcG8uY29tMB4XDTExMDYwMzA3MDcxN1oXDTIxMDUzMTA3MDcxN1owEzER\n"
        + "MA8GA1UEAwwIYWlwby5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB\n"
        + "AQDwepQIYgGBOb7WwkDNqTN05cGeappB9DtQE/I+qi/UBCc8j99G9NrGEAwzbs3Z\n"
        + "5UWk8Zfyn1isxOGhHGLkupuCUuQerFaJJWwUu4yPyDUv2Xtty8Pq0NK0CkfErBCK\n"
        + "MJnbXCOA4fQFYQLCx1SyiFYMKeVpqgE7uGTJZ31L08ZlHjEhkH9rDsM73UXo/NRO\n"
        + "EvOjqCMfi+EoV0S18TAaM46GfXGQePKILb+vguNdAQC8CHCaKqz84XXlTatpAA6y\n"
        + "9rXs4dsW2cgZHSuebhWAQkByESQ0ObIIQAzvxRwUctQbRwwrbAan+Jn2z5k1o3XJ\n"
        + "yGVQbL7PPGWHvXaZiPWzah+DAgMBAAGjUDBOMB0GA1UdDgQWBBQOIN7rsIZxz046\n"
        + "y38HXBO37bEbdDAfBgNVHSMEGDAWgBQOIN7rsIZxz046y38HXBO37bEbdDAMBgNV\n"
        + "HRMEBTADAQH/MA0GCSqGSIb3DQEBBQUAA4IBAQAvMr0YqN1noJMY74seI2cc7Ukl\n"
        + "HpjAoOaMxeImxp59t0/5owX/wXD9tNOsvHLxpz8kKOWwwgBWBcaYTqZEpK0cEdYn\n"
        + "HjujMM1PSVRScbfaS/+CtzK62s9adt+G7HN3EN7QXiZK8WUcJmIBsF2d6B3mVjfk\n"
        + "XRRBdLzQHrwnTZyjl7TfjAoHs51+DMEFwXBc4ac9S2Aqqaot9qmxPLu5TMiwr+8j\n"
        + "x2q6JFQ3M3iY2ariMULw3UMO32RC5h0eMCurnC5rjRmG/lmLCy34F+qUuTH+aBu+\n"
        + "aPbEk1FCpaOhh2fM8jWXZCPxjCgw+JhHC48CZlg2c8etwkBIm6MBwznX5SPQ\n"
        + "-----END CERTIFICATE-----";

    public void configure(AppRegistry registry) throws ConfigurationException {
        registry.register(new OpenSocialApp(
            "220",
            "https://ore-assist.appspot.com/_ah/agpvcmUtYXNzaXN0cg8LEgFwGP39________fww/view.xml",
            OpenSocialApp.createOAuthAccessorRSASHA1("aipo.com", cert)));
    }

    public void configure(ExtensionRegistry registry)
            throws ConfigurationException {

        registry.register(new ValidationLogger());
    }

}
