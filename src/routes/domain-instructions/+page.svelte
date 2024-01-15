<script lang="ts">
	import { aRecord, dashboardSites } from '$lib/config';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<link href={`${dashboardSites[0]}/domain-instructions`} rel="canonical" />
</svelte:head>

<h1>How to Configure Your Domain's DNS</h1>

<p>
	DNS can be tricky. But don't worry. You're only doing this with domains you aren't using. So don't stress too much. If
	you run into trouble, we'll help you figure it out. It's important to be patient with these changes. It can take as
	long as two days for the changes to take effect. But most of the time, you'll be able to see it working within a few
	minutes. You will need to verify each domain's DNS before you can add more.
</p>
<p>
	To connect your domains to Manic Pixie Dream URL, you'll need to make two changes to the DNS settings for your domain.
	You usually make these changes on the website where you bought the domain, known as a registrar. (If you assigned the
	domain to use a nameserver from a different company like Cloudflare, you'll go there to make these changes.) If you're
	not sure where you bought your domain, you can look it up on <a href="https://lookup.icann.org/en/lookup">ICANN</a>.
</p>
<p>
	Once you have logged in to the control panel for your domain, find the DNS settings. You want to add <strong
		>A records</strong
	>
	for the <strong>bare domain</strong> and the <strong>www. subdomain</strong> to
	<span class="mono">{aRecord}</span>. The bare domain is also known as the root domain or the apex domain. It's the
	domain name without any subdomains, like <code>example.com</code>. The www. subdomain is the domain with the www.
	prefix, like <code>www.example.com</code>. Most control panels use the "@" symbol (without quotes) to represent the
	bare domain, some will want you to use the name of the domain there. For the www. subdomain, you'll just enter "www"
	in the name field.
</p>
<p id="cloudflare">
	If you are using Cloudflare's proxy ("orange cloud"), then we won't be able to tell if DNS is setup correctly. Please
	verify your domain with orange cloud turned off first. You can do that and it will work if you set the SSL/TLS
	encryption mode to "Full (strict)." From the Cloudflare dashboard, click on the domain, then click on the SSL/TLS tab
	(or click on "Overview," the top menu item under SSL/TLS). Then select "Full (strict)." Without that setting, you will
	probably see the <a href="https://developers.cloudflare.com/ssl/troubleshooting/too-many-redirects/"
		>ERR_TOO_MANY_REDIRECTS
	</a>
	error. More details are in the
	<a href="https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/">Cloudflare doocumentation</a>.
</p>
<p>
	We wish we could tell you exactly what to look for and where the buttons are, but each company's control panel does
	things a little differently. Here are links to instructions for adding DNS records for some popular providers.
</p>
<ul>
	<li><a href="https://www.godaddy.com/help/add-an-a-record-19238">GoDaddy</a></li>
	<li><a href="https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/">Cloudflare</a></li>
	<li>
		<a
			href="https://www.namecheap.com/support/knowledgebase/article.aspx/434/2237/how-do-i-set-up-host-records-for-a-domain/"
			>Namecheap</a
		>
	</li>
	<li><a href="https://help.hover.com/hc/en-us/articles/217282457-Managing-DNS-records-">Hover</a></li>
	<li><a href="https://kb.porkbun.com/article/68-how-do-i-edit-dns">Porkbun</a></li>
</ul>

<style lang="postcss">
	ul {
		margin-block: var(--size-5);
	}
	li {
		margin-block-start: var(--size-2);
	}
</style>
