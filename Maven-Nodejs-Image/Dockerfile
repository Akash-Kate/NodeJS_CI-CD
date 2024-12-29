FROM ubuntu:24.04
RUN apt-get update \
&& apt-get install wget -y
RUN apt-get install docker.io -y
RUN apt update -y && apt install nodejs -y
RUN apt install npm -y
#RUN apt install openjdk-17-jdk-headless -y
#RUN apt update
#RUN apt install maven -y

#RUN mvn -version


# # Install Java.
# RUN apt install openjdk17 curl && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# RUN mkdir -p /usr/share/maven /usr/share/maven/ref \
#  && curl -fsSL -o /tmp/apache-maven.tar.gz ${BASE_URL}/apache-maven-${MAVEN_VERSION}-bin.tar.gz \
#  && tar -xzf /tmp/apache-maven.tar.gz -C /usr/share/maven --strip-components=1 \
#  && rm -f /tmp/apache-maven.tar.gz \
#  && ln -s /usr/share/maven/bin/mvn /usr/bin/mvn

# ENV MAVEN_HOME /usr/share/maven
# ENV MAVEN_CONFIG "$USER_HOME_DIR/.m2"

# # Define working directory.
# WORKDIR /data

# # Define commonly used JAVA_HOME variable
# ENV JAVA_HOME /usr/lib/jvm/default-jvm/

# #ENTRYPOINT node -v