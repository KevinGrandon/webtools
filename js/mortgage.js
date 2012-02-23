/**
 * Mortgage Calculator
 * Inspiration: David Tufts <http://dave.imarc.net> 
 */

!function() {
	
function getFloat(value) {
	value = value.replace(/[^0-9\.]*/g, '');
	return parseFloat(value);
}

n.one('.mortgage-calc').on('submit', function(e) {
	e.stop();

	var salePrice                  = getFloat(nwt.one('#m_sale_price').get('value'))
	, mortgageInterestPercent      = getFloat(nwt.one('#m_mortgage_interest_percent').get('value'))
	, yearTerm                     = getFloat(nwt.one('#m_year_term').get('value'))
	, downPercent                  = getFloat(nwt.one('#m_down_percent').get('value'))
	, assessedValue                = getFloat(nwt.one('#m_assessed_value').get('value'))
	, propertyTaxRate              = getFloat(nwt.one('#m_property_tax_rate').get('value'))
	, condoFee                     = getFloat(nwt.one('#m_condo_fee').get('value'))

	, pmiPerMonth                  = 0
	, totalMonthlyBill             = 0
	, monthTerm                    = yearTerm * 12

	/**
	 * Calculates actual mortgage calculations by plotting a PVIFA table
	 * (Present Value Interest Factor of Annuity)
	 *
	 * @param  float  length, in years, of mortgage
	 * @param  float  monthly interest rate
	 * @return float  denominator used to calculate monthly payment
	 */
	, _get_interest_factor = function(yearTerm, monthlyInterestRate) {	
		factor      = 0;
		baseRate   = 1 + monthlyInterestRate;
		denominator = baseRate;
		for (var i=0; i < (yearTerm * 12); i++) {
			factor += (1 / denominator);
			denominator *= baseRate;
		}
		return factor;
	};


	// validation
	if ((yearTerm <= 0) || (salePrice <= 0) || (mortgageInterestPercent <= 0)) {
		throw new Exception ( 'You must enter a <strong>Sale Price</strong>, <strong>Length of Mortgage</strong> and <strong>Annual Interest Rate</strong>');
	}
	if (assessedValue <= 0 && salePrice > 0) {
		assessedValue = salePrice * .85;
	}
	
	
	
	/* --------------------------------------------------------------------- */
	/* KEY CALCULATIONS
	/* --------------------------------------------------------------------- */

	// financing & down payment numbers
	var downPayment          = salePrice * (downPercent / 100)
	, financingPrice         = salePrice - downPayment

	// interest rates
	, annualInterestRate   = mortgageInterestPercent / 100
	, monthlyInterestRate  = annualInterestRate / 12

	// Principal & Interest monthly payment: financing & interest numbers from above as well as yearTerm (length of mortgage, entered by user)
	, monthlyPayment         = financingPrice / _get_interest_factor(yearTerm, monthlyInterestRate)
	
	// taxes
	, propertyYearlyTax     = (assessedValue / 1000) * propertyTaxRate
	, propertyMonthlyTax    = propertyYearlyTax / 12;
	
	// PMI, if necessary 
	if (downPercent < 20) { 
		var pmiPerMonth       = 55 * (financingPrice / 100000);
	}

	// Total principal, interest, pmi, taxes, fees
	var totalMonthlyBill      = monthlyPayment + pmiPerMonth + propertyMonthlyTax + condoFee

	// Set some base variables
	, principal	              = financingPrice
	, currentMonth             = 1
	, currentYear              = 1
	, thisYearInterestPaid     = 0
	, thisYearPrincipalPaid    = 0
	, totalSpentOverTerm       = 0

	// Re-figures out the monthly payment.
	, power = -(monthTerm)
	, denom = Math.pow((1 + monthlyInterestRate), power)
	, monthlyPayment = principal * (monthlyInterestRate / (1 - denom))
	
	// This LEGEND will get reprinted every 12 months
	, legend  = '<tr class="legend">' +
		'<td>Month</td>' +
		'<td>Interest Paid</td>' +
		'<td>Principal Paid</td>' +
		'<td>Remaining Balance</td>' +
		'</tr>'

	, content = '<h2>Mortgage Payment Information</h2>' +
	'<table>' +
		'<tr>' +
			'<th>Down Payment:</th>' +
			'<td>' +
				currency(downPayment) +
			'</td>' +
		'</tr>' +
		'<tr>' +
			'<th>Amount Financed:</th>' +
			'<td>' +
				currency(financingPrice) +
			'</td>' +
		'</tr>' +
		'<tr>' +
			'<th>Monthly Payment:</th>' +
			'<td>' +
				currency(monthlyPayment) + '<span class="info">(Principal &amp; Interest ONLY)</span>' +
			'</td>' +
		'</tr>';
		
		if (pmiPerMonth) {
			content += '<tr class="pmi">' +
				'<td colspan="2">' +
					'<p class="info">Since you put less than 20% down, you will pay <a href="http://www.google.com/search?hl=en&amp;q=private+mortgage+insurance">Private Mortgage Insurance</a>. <acronym title="Private Mortgage Insurance">PMI</acronym> tends to be about $55 per month for every $100,000 financed (until you have paid off 20% of your loan). This adds <strong>' + currency(pmiPerMonth) + '</strong> to your monthly payment.</p>' +
				'</td>' +
			'</tr>';
		}

		content += '<tr class="tax">' +
			'<td colspan="2">' +
				'<p class="info">Your property tax rate is ' +currency(propertyTaxRate) + ' per $1000. Your home\'s assessed value is ' + currency(assessedValue) + '.This means that your yearly property taxes will be ' + currency(propertyYearlyTax) + ', or ' + currency(propertyMonthlyTax) + ' per month.</p>' +
			'</td>' +
		'</tr>' +
	'</table>' +

	'<h2>Your Total Monthly Payment</h2>' +
	'<table>' +
		'<tr>' +
			'<td>Mortgage (Principal &amp; Interest)</td>' +
			'<td>' + currency(monthlyPayment) + '</td>' +
		'</tr>' +
		'<tr>' +
			'<td><acronym title="Private Mortgage Insurance">PMI</acronym></td>' +
			'<td>' +currency(pmiPerMonth) + '</td>' +
		'</tr>' +
		'<tr>' +
			'<td>Property Tax</td>' +
			'<td>' + currency(propertyMonthlyTax) + '</td>' +
		'</tr>' +
		'<tr>' +
			'<td>Condo Fee</td>' +
			'<td>' + currency(condoFee) + '</td>' +
		'</tr>' +
		'<tr class="total">' +
			'<td>Total Monthly Payment</td>' +
			'<td>' + currency(totalMonthlyBill) + '</td>' +
		'</tr>' +
	'</table>' +

	'<h2>Calculations</h2>' +
	'<p>To figure out the monthly payment, we need to know (1) how much you\'re financing; (2) your monthly interest rate; and (3) how many months you\'re financing for.</p>' +
	'<p>Financials are typically quoted in yearly or annual numbers&mdash;<em>a 30-year mortgage or a 6% annual interest</em>. However, you pay your mortgage every month. A lot of the calculations involve translating those yearly numbers to their monthly equivalents.</p>' +
	'<div class="well">' +
		'<h3>1. Financing Price</h3>' +
		'<p>First, we need to figure how much you\'re financing.</p>' +
		'<p>We can do this based on the sale price of the home (<strong>' + currency(salePrice) + '</strong>) and the percent that you put down (<strong>' + downPercent + '%</strong>).</p>' +
		'<p>Start by calculating the down payment. Divide the percentage down by 100, then multiply by the sale price of the home.</p>' +
		'<p>(' + downPercent + '% / 100) x ' + currency(salePrice) + ' = <strong>' + currency(downPayment) + '</strong>, <em>your down payment</em></p>' +
		'<p>Now we can calculate how much you\'re financing&mdash;how much you need to borrow. That\'s just the sale price minus your down payment.</p>' +
		'<p class="result">' + currency(salePrice) + ' - ' + currency(downPayment) + ' = <strong>' + currency(financingPrice) + '</strong>, <em>your financing price</em></p>' +
	'</div>' +
	'<div class="well">' +
		'<h3>2. Monthly Interest Rate</h3>' +
		'<p>That <strong>' + mortgageInterestPercent + '%</strong> interest rate percentage you secured is an <em>annual</em> percent.</p>' +
		'<p>We\'ll need to convert that from a percentage to a decimal rate, and from an annual representation to a monthly one.</p>' +
		'<p>First, let\'s convert it to a decimal, by dividing the percent by 100.</p>' +
		'<p>' + mortgageInterestPercent + '% / 100 = <strong>' + annualInterestRate + '</strong>, <em>the annual interest rate</em></p>' +
		'<p>Now convert the annual rate to a monthly rate by dividing by 12 (for 12 months in a year).</p>' +
		'<p class="result">' + annualInterestRate + ' / 12 = <strong>' + monthlyInterestRate + '</strong>, <em>your monthly interest rate</em></p>' +
	'</div>' +
	'<div class="well">' +
		'<h3>3. Month Term</h3>' +
		'<p>Now for an easy calculation&mdash;the <strong>month term</strong>. That\'s just the number of months you\'ll be paying off your loan.</p>' +
		'<p class="result">You have a ' + yearTerm + ' year mortgage x 12 months = <strong>' + monthTerm + ' months</strong>, <em>your month term</em>.</p>' +
	'</div>' +
	'<div class="well">' +
		'<h3>Final: Your Monthly Mortgage Payment</h3>' +
		'<p>Using the three numbers above, we can now calculate your monthly payment.</p>' +
		'<p>(financing price) x (monthly interest rate / (1 - ((1+monthly interest rate)<sup>-(monthly term)</sup>)))</p>' +
		'<p class="result">' + currency(financingPrice) + ' x (' + (Math.round(monthlyInterestRate*10000)/10000) + ' / (1 - ((1 + ' + (Math.round(monthlyInterestRate*10000)/10000) + ')<sup>-(' + monthTerm + ')</sup>))) = <strong>' + currency(monthlyPayment) + '</strong>, <em>your monthly payment*</em></p>' +
		'<p>*<em>Principal &amp; Interest only</em>. See <a href="#total_payment">total monthly payment</a> for a your mortgage plus taxes, insurance, and fees. See <a href="#amortization">amortization</a> for a breakdown of how each monthly payment is split between the bank\'s interest and paying off the loan principal.</p>' +
	'</div>';

	content += '<h2>Amortization</h2>' +
		'<p>Amortization for monthly payment, ' + currency(monthlyPayment) + ', over ' + yearTerm + ' years. Mortgage amortization only includes your monthly principal and interest payments. Property taxes, PMI, and condo fees are ignored when amortizing your mortgage.</p>' +
	'<table class="table table-bordered table-striped table-condensed">' +
	legend;

	// Get the current month's payments for each month of the loan 
	while (currentMonth <= monthTerm) {	

		var interestPaid	     = principal * monthlyInterestRate
		, principalPaid          = monthlyPayment - interestPaid
		, remainingBalance       = principal - principalPaid
		, showLegend             = (currentMonth % 12) ? false : true;

		thisYearInterestPaid   = thisYearInterestPaid + interestPaid;
		thisYearPrincipalPaid  = thisYearPrincipalPaid + principalPaid;
		totalSpentOverTerm     = totalSpentOverTerm + (interestPaid + principalPaid);
		
		content += '<tr>' +
					'<td>' + currentMonth + '</td>' +
					'<td>' + currency(interestPaid) + '</td>' +
					'<td>' + currency(principalPaid) + '</td>' +
					'<td>' + currency(remainingBalance) + '</td>' +
				'</tr>';
		
		if (showLegend) {
			content += '<tr class="year_summary">' +
				'<td colspan="4">' +
					'<strong>Year ' + currentYear + ' Summary:</strong> ' +
					'<span class="coaching">' +
						'You spent ' + currency(thisYearInterestPaid + thisYearPrincipalPaid) +
					'</span>' +
					'<p>' +
						currency(thisYearPrincipalPaid) + ' went to principal <span class="coaching">This is equity that your building up</span><br>' +
						currency(thisYearInterestPaid) + '  went to interest <span class="coaching">This is typically tax deductible</span>' +
					'</p>' +
				'</td>' +
			'</tr>';

			currentYear++;
			thisYearPrincipalPaid  = 0;
			thisYearPrincipalPaid = 0;

			if ((currentMonth + 6) < monthTerm) {
				content += legend;
			}
		}

		principal = remainingBalance;
		currentMonth++;
	}

	content += '<tr class="total_summary">' +
			'<td colspan="4">' +
				'Principal &amp; interest costs for the full  ' + yearTerm + ' years of this mortgage total&hellip;<span class="total_spent_over_term">' + currency(totalSpentOverTerm) + '</span>' +
			'</td>' +
		'</tr>' +
	'</table>';
	
	n.one('#mortgagedata').setContent(content);
});

}();