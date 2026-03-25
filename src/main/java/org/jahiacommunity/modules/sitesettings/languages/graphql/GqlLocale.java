package org.jahiacommunity.modules.sitesettings.languages.graphql;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import graphql.annotations.annotationTypes.GraphQLNonNull;
import org.codehaus.plexus.util.StringUtils;
import org.jahia.utils.LanguageCodeConverters;

import java.util.Locale;

public class GqlLocale {
    private final Locale locale;
    private final long count;

    public GqlLocale(Locale locale) {
        this(locale, 0L);
    }

    public GqlLocale(Locale locale, long count) {
        this.locale = locale;
        this.count = count;
    }

    @GraphQLField
    public String getLanguage() {
        return locale.toString();
    }

    @GraphQLField
    public String getDisplayName(@GraphQLName("language") @GraphQLNonNull String language) {
        return StringUtils.capitalise(locale.getDisplayName(LanguageCodeConverters.languageCodeToLocale(language)));
    }

    @GraphQLField
    @GraphQLDescription("Count locale usage")
    public long getCount() {
        return count;
    }
}
