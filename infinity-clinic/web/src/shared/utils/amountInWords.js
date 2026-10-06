/**
 * Convert number amount to Indian currency words format
 * Example: 2500 -> "Rupees Two Thousand Five Hundred Only"
 */
export function numberToWords(num) {
  const n = Math.floor(Number(num) || 0);
  if (n === 0) return 'Rupees Zero Only';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(val) {
    if (val < 20) return a[val];
    const digit = val % 10;
    return b[Math.floor(val / 10)] + (digit ? ' ' + a[digit] : '');
  }

  let words = '';

  const crore = Math.floor(n / 10000000);
  let rem = n % 10000000;

  const lakh = Math.floor(rem / 100000);
  rem %= 100000;

  const thousand = Math.floor(rem / 1000);
  rem %= 1000;

  const hundred = Math.floor(rem / 100);
  rem %= 100;

  if (crore > 0) {
    words += inWords(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += inWords(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += inWords(thousand) + ' Thousand ';
  }
  if (hundred > 0) {
    words += inWords(hundred) + ' Hundred ';
  }
  if (rem > 0) {
    words += (words !== '' ? 'and ' : '') + inWords(rem) + ' ';
  }

  return 'Rupees ' + words.trim() + ' Only';
}
