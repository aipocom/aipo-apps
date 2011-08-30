/*
 * This file is part of official Aipo App.
 * Copyright (C) 2011-2011 Aimluck,Inc.
 * http://www.aipo.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
package com.aimluck.filter.config
import org.hidetake.opensocial.filter.config.RegistryConfigurator
import org.hidetake.opensocial.filter.model.AppRegistry
import org.hidetake.opensocial.filter.config.ConfigurationException
import org.hidetake.opensocial.filter.model.OpenSocialApp
import org.hidetake.opensocial.filter.model.ExtensionRegistry
import org.hidetake.opensocial.filter.extension.ValidationLogger

class AipoAppsConfigurator extends RegistryConfigurator {
  val cert: String = """
-----BEGIN CERTIFICATE-----
MIIC+TCCAeGgAwIBAgIJAPgmgzknJyVzMA0GCSqGSIb3DQEBBQUAMBMxETAPBgNV
BAMMCGFpcG8uY29tMB4XDTExMDYwMzA3MDcxN1oXDTIxMDUzMTA3MDcxN1owEzER
MA8GA1UEAwwIYWlwby5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB
AQDwepQIYgGBOb7WwkDNqTN05cGeappB9DtQE/I+qi/UBCc8j99G9NrGEAwzbs3Z
5UWk8Zfyn1isxOGhHGLkupuCUuQerFaJJWwUu4yPyDUv2Xtty8Pq0NK0CkfErBCK
MJnbXCOA4fQFYQLCx1SyiFYMKeVpqgE7uGTJZ31L08ZlHjEhkH9rDsM73UXo/NRO
EvOjqCMfi+EoV0S18TAaM46GfXGQePKILb+vguNdAQC8CHCaKqz84XXlTatpAA6y
9rXs4dsW2cgZHSuebhWAQkByESQ0ObIIQAzvxRwUctQbRwwrbAan+Jn2z5k1o3XJ
yGVQbL7PPGWHvXaZiPWzah+DAgMBAAGjUDBOMB0GA1UdDgQWBBQOIN7rsIZxz046
y38HXBO37bEbdDAfBgNVHSMEGDAWgBQOIN7rsIZxz046y38HXBO37bEbdDAMBgNV
HRMEBTADAQH/MA0GCSqGSIb3DQEBBQUAA4IBAQAvMr0YqN1noJMY74seI2cc7Ukl
HpjAoOaMxeImxp59t0/5owX/wXD9tNOsvHLxpz8kKOWwwgBWBcaYTqZEpK0cEdYn
HjujMM1PSVRScbfaS/+CtzK62s9adt+G7HN3EN7QXiZK8WUcJmIBsF2d6B3mVjfk
XRRBdLzQHrwnTZyjl7TfjAoHs51+DMEFwXBc4ac9S2Aqqaot9qmxPLu5TMiwr+8j
x2q6JFQ3M3iY2ariMULw3UMO32RC5h0eMCurnC5rjRmG/lmLCy34F+qUuTH+aBu+
aPbEk1FCpaOhh2fM8jWXZCPxjCgw+JhHC48CZlg2c8etwkBIm6MBwznX5SPQ
-----END CERTIFICATE-----
"""

  @throws(classOf[ConfigurationException])
  def configure(registry: AppRegistry): Unit =
    {
      registry.register(new OpenSocialApp(
        null, // アプリID
        null, // ガジェットXMLのURL
        OpenSocialApp.createOAuthAccessorRSASHA1("aipo.com", cert)));
    }
  @throws(classOf[ConfigurationException])
  def configure(registry: ExtensionRegistry) {
    // ログを出力するエクステンション
    registry.register(new ValidationLogger());
  }
}