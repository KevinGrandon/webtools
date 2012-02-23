/**
 * Mortgage Calculator
 * Inspiration: David Tufts <http://dave.imarc.net> 
 */

!function() {

n.one('.mortgage-calc').on('submit', function(e) {
	e.stop();

	var salePrice                  = parseFloat(nwt.one('#m_sale_price').get('value'))
	, mortgageInterestPercent      = parseFloat(nwt.one('#m_mortgage_interest_percent').get('value'))
	, yearTerm                     = parseFloat(nwt.one('#m_year_term').get('value'))
	, downPercent                  = parseFloat(nwt.one('#m_down_percent').get('value'))
	, assessedValue                = parseFloat(nwt.one('#m_assessed_value').get('value'))
	, propertyTaxRate              = parseFloat(nwt.one('#m_property_tax_rate').get('value'))
	, condoFee                     = parseFloat(nwt.one('#m_condo_fee').get('value'))

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
	_get_interest_factor = function(yearTerm, monthlyInterestRate) {	
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
		'</tr>';

	var content = '<h2>Amortization</h2>' +
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