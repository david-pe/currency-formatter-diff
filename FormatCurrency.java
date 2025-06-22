import java.text.NumberFormat;
import java.util.Currency;
import java.util.Locale;

public class FormatCurrency {
    public static void main(String[] args) {
        if (args.length != 3) {
            System.err.println("Usage: java FormatCurrency <locale> <currency_code> <value>");
            System.exit(1);
        }

        String localeStr = args[0];
        String currencyCode = args[1];
        double value = Double.parseDouble(args[2]);

        String[] localeParts = localeStr.split("-");
        Locale locale;
        if (localeParts.length == 2) {
            locale = new Locale(localeParts[0], localeParts[1]);
        } else {
            locale = new Locale(localeParts[0]);
        }

        NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(locale);
        currencyFormatter.setCurrency(Currency.getInstance(currencyCode));

        System.out.println(currencyFormatter.format(value));
        // uncomment this to verify the locale library being used
        //System.err.println("Current locale library: " + System.getProperty("java.locale.providers"));
    }
}